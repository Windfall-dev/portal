import { WalletAdapterProps } from "@solana/wallet-adapter-base";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useState } from "react";

import { useProgrammableWallet } from "./useProgrammableWallet";

const WindfallPublicKey = process.env.NEXT_PUBLIC_WINDFALL_PUBLIC_KEY || "";

// Phantomで入金する
interface useDepositSolResult {
  depositSolana: (
    publicKey: PublicKey,
    sendTransactionSolana: WalletAdapterProps["sendTransaction"],
    amount: number,
  ) => Promise<string | undefined>;
  depositTelegram: () => Promise<string | undefined>;
  loading: boolean;
  error: Error | null;
}

export function useDepositSol(): useDepositSolResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { walletAddress, signTransaction } = useProgrammableWallet();

  const depositSolana = async (
    publicKey: PublicKey,
    sendTransactionSolana: WalletAdapterProps["sendTransaction"],
    amount: number,
  ): Promise<string | undefined> => {
    const lamportAmount = amount * LAMPORTS_PER_SOL;
    if (!publicKey) {
      const err = new Error("No Solana wallet connected");
      setError(err);
      throw err;
    }

    setLoading(true);
    setError(null);

    try {
      const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed",
      );

      const toPublicKey = new PublicKey(WindfallPublicKey);

      const transferTransaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: toPublicKey,
          lamports: lamportAmount,
        }),
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transferTransaction.recentBlockhash = blockhash;
      transferTransaction.feePayer = publicKey;

      const signature = await sendTransactionSolana(
        transferTransaction,
        connection,
      );

      console.log("Transaction sent:", signature);
      console.log(`https://solscan.io/tx/${signature}?cluster=devnet`);

      await connection.confirmTransaction(signature, "confirmed");
      console.log("Transaction confirmed");

      setLoading(false);
      return signature;
    } catch (err) {
      console.error("Transaction failed", err);
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  };

  // Programmable Walletで入金する
  const depositTelegram = async () => {
    const connection = new Connection("https://api.devnet.solana.com");
    const { blockhash } = await connection.getLatestBlockhash();
    const lamportAmount = 0.01 * LAMPORTS_PER_SOL;
    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: new PublicKey(walletAddress),
    });
    const instruction = SystemProgram.transfer({
      fromPubkey: new PublicKey(walletAddress),
      toPubkey: new PublicKey(WindfallPublicKey),
      lamports: lamportAmount,
    });
    console.log("instruction", instruction);
    transaction.add(instruction);
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });
    const signedTransactionBase64 = await signTransaction(
      serializedTransaction.toString("base64"),
    );
    const signedTransaction = Buffer.from(signedTransactionBase64, "base64");
    try {
      const txId = await connection.sendRawTransaction(signedTransaction);
      console.log("Transaction sent! Transaction ID:", txId);
      const confirmation = await connection.confirmTransaction(txId);
      console.log("Transaction confirmed:", confirmation);
      return txId;
    } catch (error) {
      console.error("Error broadcasting transaction:", error);
    }
  };

  return { depositTelegram, depositSolana, loading, error };
}
