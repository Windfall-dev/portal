import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import { useState } from "react";

import { useProgrammableWallet } from "./useProgrammableWallet";

const WindfallPrivateKey = process.env.NEXT_PUBLIC_WINDFALL_PRIVATE_KEY || "";
const WindfallPublicKey = process.env.NEXT_PUBLIC_WINDFALL_PUBLIC_KEY || "";

interface UseWithdrawSolResult {
  withdrawSolana: (
    publicKey: PublicKey,
    amount: number,
  ) => Promise<string | undefined>;
  withdrawTelegram: () => Promise<string | undefined>;
  loading: boolean;
  error: Error | null;
}

// Phantomで出金する
export function useWithdrawSol(): UseWithdrawSolResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { walletAddress, signTransaction } = useProgrammableWallet();

  const withdrawSolana = async (
    publicKey: PublicKey,
    amount: number,
  ): Promise<string | undefined> => {
    if (!publicKey) {
      const err = new Error("No Solana wallet connected");
      setError(err);
      throw err;
    }

    setLoading(true);
    setError(null);

    try {
      const windfallKeypair = Keypair.fromSecretKey(
        bs58.decode(WindfallPrivateKey),
      );

      const lamportsToSend = amount * LAMPORTS_PER_SOL;

      const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed",
      );

      const transferTransaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: windfallKeypair.publicKey,
          toPubkey: publicKey,
          lamports: lamportsToSend,
        }),
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transferTransaction.recentBlockhash = blockhash;
      transferTransaction.feePayer = windfallKeypair.publicKey;

      transferTransaction.sign(windfallKeypair);

      const signature = await connection.sendRawTransaction(
        transferTransaction.serialize(),
      );

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

  const withdrawTelegram = async () => {
    const connection = new Connection("https://api.devnet.solana.com");
    const { blockhash } = await connection.getLatestBlockhash();
    const amount = 0.01 * LAMPORTS_PER_SOL;

    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: new PublicKey(walletAddress),
    });
    const instruction = SystemProgram.transfer({
      fromPubkey: new PublicKey(WindfallPublicKey),
      toPubkey: new PublicKey(walletAddress),
      lamports: amount,
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

  return { withdrawSolana, withdrawTelegram, loading, error };
}
