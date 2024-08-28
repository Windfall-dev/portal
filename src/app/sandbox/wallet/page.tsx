"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

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

  const handleSendTransactionSolana = async () => {
    if (!publicKey) {
      throw new Error("No Solana wallet connected");
    }
    const connection = new Connection("https://api.devnet.solana.com");
    const { blockhash } = await connection.getLatestBlockhash();
    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: publicKey,
    });
    // need to be update with actual transaction
    const instruction = SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: publicKey,
      lamports: 0, // 0 SOL transfer for this example
    });
    transaction.add(instruction);
    const signature = await sendTransactionSolana(transaction, connection);
    const result = await connection.confirmTransaction(signature, "processed");
    console.log("Transaction confirmed", result);
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
            <Button onClick={handleSendTransactionSolana}>
              Send Transaction
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
