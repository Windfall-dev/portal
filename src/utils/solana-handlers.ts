import { WalletAdapterProps } from "@solana/wallet-adapter-base";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import bs58 from "bs58";

const WindfallPublicKey = process.env.NEXT_PUBLIC_WINDFALL_PUBLIC_KEY;

export const handleDepositSol = async (
  publicKey: PublicKey,
  sendTransactionSolana: WalletAdapterProps["sendTransaction"],
) => {
  if (!publicKey) {
    console.error("No Solana wallet connected");
    return;
  }

  try {
    const connection = new Connection(
      "https://api.devnet.solana.com",
      "confirmed",
    );

    const toPublicKey = new PublicKey(WindfallPublicKey || "");
    const lamportsToSend = 0.01 * LAMPORTS_PER_SOL; // 0.01 SOL

    const transferTransaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: toPublicKey,
        lamports: lamportsToSend,
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

    const confirmation = await connection.confirmTransaction(
      signature,
      "confirmed",
    );
    console.log("Transaction confirmed:", confirmation);
  } catch (error) {
    console.error("Transaction failed", error);
  }
};

export const handleWithdrawSol = async (publicKey: PublicKey) => {
  if (!publicKey) {
    console.error("No Solana wallet connected");
    return;
  }

  const windfallKeypair = Keypair.fromSecretKey(
    bs58.decode(process.env.NEXT_PUBLIC_WINDFALL_PRIVATE_KEY || ""),
  );

  const lamportsToSend = 0.005 * LAMPORTS_PER_SOL; // 0.01 SOL

  console.log(process.env.NEXT_PUBLIC_WINDFALL_PRIVATE_KEY);

  try {
    const connection = new Connection(
      "https://api.devnet.solana.com",
      "confirmed",
    );

    const balance = await connection.getBalance(windfallKeypair.publicKey);
    console.log("Windfall account balance:", balance / LAMPORTS_PER_SOL, "SOL");

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

    console.log("Transaction sent:", signature);
    console.log(`https://solscan.io/tx/${signature}?cluster=devnet`);

    const confirmation = await connection.confirmTransaction(
      signature,
      "confirmed",
    );
    console.log("Transaction confirmed:", confirmation);
  } catch (error) {
    console.error("Transaction failed", error);
  }
};
