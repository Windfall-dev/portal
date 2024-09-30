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

const windfallKeypair = Keypair.fromSecretKey(
  bs58.decode(process.env.NEXT_PUBLIC_WINDFALL_PRIVATE_KEY || ""),
);
const windfallPublicKey = windfallKeypair.publicKey;

interface UseWithdrawSolResult {
  withdrawSolana: (
    publicKey: PublicKey,
    lamportAmount: number,
  ) => Promise<string | undefined>;
  withdrawTelegram: () => Promise<string | undefined>;
  loading: boolean;
  error: Error | null;
}

// Phantomで出金する
export function useWithdrawSol(): UseWithdrawSolResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { walletAddress } = useProgrammableWallet();
  const withdrawSolana = async (
    publicKey: PublicKey,
    lamportAmount: number,
  ): Promise<string | undefined> => {
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

      const transferTransaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: windfallPublicKey,
          toPubkey: publicKey,
          lamports: lamportAmount,
        }),
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transferTransaction.recentBlockhash = blockhash;
      transferTransaction.feePayer = windfallPublicKey;

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
    console.log("windfallPublicKey", windfallPublicKey);
    const lamportAmount = 0.01 * LAMPORTS_PER_SOL;

    try {
      const connection = new Connection("https://api.devnet.solana.com");
      const transferTransaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: windfallPublicKey,
          toPubkey: new PublicKey(walletAddress),
          lamports: lamportAmount,
        }),
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transferTransaction.recentBlockhash = blockhash;
      transferTransaction.feePayer = windfallPublicKey;

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

  return { withdrawSolana, withdrawTelegram, loading, error };
}
