"use client";

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
    console.log(`0x${serializedTransaction.toString("hex")}`);
    sendTransaction(`0x${serializedTransaction.toString("hex")}`);
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
    </div>
  );
}
