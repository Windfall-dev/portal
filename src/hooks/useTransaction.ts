import { WalletAdapterProps } from "@solana/wallet-adapter-base";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

import { useDepositSol } from "@/hooks/useDepositSol";
import { useWithdrawSol } from "@/hooks/useWithdrawSol";

import { useProgrammableWallet } from "./useProgrammableWallet";

interface UseTransactionProps {
  publicKey: PublicKey | null;
  sendTransaction: WalletAdapterProps["sendTransaction"];
  actionType: "deposit" | "withdraw";
  amount: string;
  contextUserId: string;
  handleAddPoints: (amount: number, userId: string) => Promise<void>;
}

const MAX_DEPOSIT_AMOUNT = 0.01;

export const useTransaction = ({
  publicKey,
  sendTransaction,
  actionType,
  amount,
  contextUserId,
  handleAddPoints,
}: UseTransactionProps) => {
  const { depositTelegram, depositSolana } = useDepositSol();
  const { withdrawSolana, withdrawTelegram } = useWithdrawSol();
  const { walletAddress } = useProgrammableWallet();

  const lamportAmount = parseFloat(amount) * LAMPORTS_PER_SOL;
  const runTransaction = async (): Promise<string | undefined> => {
    if (actionType === "deposit") {
      const sendAmount =
        lamportAmount > MAX_DEPOSIT_AMOUNT ? MAX_DEPOSIT_AMOUNT : lamportAmount;

      let signature: string | undefined;
      if (walletAddress != "") {
        signature = await depositTelegram();
      } else {
        if (!publicKey || !sendTransaction) {
          throw new Error("Wallet is not connected.");
        }
        signature = await depositSolana(publicKey, sendTransaction, sendAmount);
      }

      if (!signature) {
        throw new Error("Deposit transaction failed.");
      }

      await handleAddPoints(parseFloat(amount), contextUserId);
      return signature;
    } else {
      let signature: string | undefined;
      if (walletAddress != "") {
        console.log("WithdrawTelegram Called");
        signature = await withdrawTelegram();
      } else {
        if (!publicKey || !sendTransaction) {
          throw new Error("Wallet is not connected.");
        }

        signature = await withdrawSolana(publicKey, lamportAmount);
      }
      if (!signature) {
        throw new Error("Withdraw transaction failed.");
      }

      return signature;
    }
  };

  return { runTransaction };
};
