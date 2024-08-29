"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  SystemProgram,
  VersionedTransaction,
} from "@solana/web3.js";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useProgrammableWallet } from "@/hooks/useProgrammableWallet";

export default function SandboxWalletPage() {
  const { walletAddress, signMessage, sendTransaction } =
    useProgrammableWallet();
  const {
    publicKey,
    signMessage: signMessageSolana,
    sendTransaction: sendTransactionSolana,
  } = useWallet();
  const walletAddressSolana = publicKey?.toBase58();
  const [swapStatus, setSwapStatus] = useState("");

  const handleSignMessage = () => {
    signMessage("Hello");
  };

  const handleSignTransaction = async () => {
    const connection = new Connection("https://api.devnet.solana.com");
    const { blockhash } = await connection.getLatestBlockhash();
    const amount = 0;
    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: new PublicKey(walletAddress),
    });
    // need to be update with actual transaction
    const instruction = SystemProgram.transfer({
      fromPubkey: new PublicKey(walletAddress),
      toPubkey: new PublicKey(walletAddress),
      lamports: amount,
    });
    console.log("instruction", instruction);
    transaction.add(instruction);
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });
    sendTransaction(`0x${serializedTransaction.toString("hex")}`);
  };

  const handleSignMessageSolana = async () => {
    if (!signMessageSolana) {
      throw new Error("Sign message is not enabled");
    }
    const message = new TextEncoder().encode("Hello");
    signMessageSolana(message);
  };

  const handleSendTransactionSolana =
    (
      inputMint: string,
      outputMint: string,
      amount: number,
      slippageBps: number,
    ) =>
    async () => {
      if (!publicKey) {
        setSwapStatus("No Solana wallet connected");
        return;
      }

      setSwapStatus("Initiating swap...");

      const connection = new Connection(
        "https://alpha-omniscient-silence.solana-mainnet.quiknode.pro/9cce57ab92b024ae3b69476ca0beecc729e9ba20/",
      );
      try {
        const quoteResponse = await fetch(
          `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`,
        ).then((res) => res.json());
        setSwapStatus("Quote received. Preparing transaction...");

        const { swapTransaction } = await fetch(
          "https://quote-api.jup.ag/v6/swap",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              quoteResponse,
              userPublicKey: publicKey.toString(),
              wrapAndUnwrapSol: true,
            }),
          },
        ).then((res) => res.json());
        const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
        const transaction =
          VersionedTransaction.deserialize(swapTransactionBuf);
        setSwapStatus("Transaction prepared. Sending for approval...");

        const signature = await sendTransactionSolana(transaction, connection);
        setSwapStatus("Transaction sent. Awaiting confirmation...");

        const result = await connection.confirmTransaction(
          signature,
          "processed",
        );
        setSwapStatus(`Swap completed! Transaction ID: ${signature}`);
        console.log("Swap transaction confirmed", result);
      } catch (error) {
        console.error("Swap failed:", error);
        setSwapStatus(`Swap failed: ${error.message}`);
      }
    };

  return (
    <div>
      <h2>Programmable Wallet</h2>
      {!walletAddress && <p>Telegram & programmable wallet is not enabled</p>}
      {walletAddress && (
        <>
          <p>Wallet Address: {walletAddress}</p>
          <div className="flex flex-col space-y-2">
            <Button onClick={handleSignMessage}>Sign Message</Button>
            <Button onClick={handleSignTransaction}>Send Transaction</Button>
          </div>
        </>
      )}
      <h2>Solana Wallet</h2>
      {!walletAddressSolana && <p>Solana wallet is not enabled</p>}
      {walletAddressSolana && (
        <>
          <p>Wallet Address: {walletAddressSolana}</p>
          <div className="flex flex-col space-y-2">
            <Button onClick={handleSignMessageSolana}>Sign Message</Button>
            <Button
              onClick={handleSendTransactionSolana(
                "So11111111111111111111111111111111111111112",
                "5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm",
                10000000,
                50,
              )}
            >
              Send Transaction(Swap wSOL to INF)
            </Button>
            <Button
              onClick={handleSendTransactionSolana(
                "5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm",
                "So11111111111111111111111111111111111111112",
                5000000,
                50,
              )}
            >
              Send Transaction(Swap INF to wSOL)
            </Button>
            <p>{swapStatus}</p>
          </div>
        </>
      )}
    </div>
  );
}
