import { WalletAdapterProps } from "@solana/wallet-adapter-base";
import { PublicKey } from "@solana/web3.js";

import { useDepositSol } from "@/hooks/useDepositSol";
import { useWithdrawSol } from "@/hooks/useWithdrawSol";

interface UseTransactionProps {
  publicKey: PublicKey | null;
  sendTransaction: WalletAdapterProps["sendTransaction"];
  actionType: "deposit" | "withdraw";
  amount: string;
  contextUserId: string;
  handleAddPoints: (amount: number, userId: string) => Promise<void>;
  MAX_DEPOSIT_AMOUNT: number;
}

interface TransactionResult {
  success: boolean;
  signature: string;
}

export const useTransaction = ({
  publicKey,
  sendTransaction,
  actionType,
  amount,
  contextUserId,
  handleAddPoints,
  MAX_DEPOSIT_AMOUNT,
}: UseTransactionProps) => {
  const { depositTelegram, depositSolana } = useDepositSol();
  const { withdrawSolana, withdrawTelegram } = useWithdrawSol();

  const runTransaction = async (): Promise<TransactionResult> => {
    if (actionType === "deposit") {
      const sendAmount =
        parseFloat(amount) > MAX_DEPOSIT_AMOUNT
          ? MAX_DEPOSIT_AMOUNT
          : parseFloat(amount);

      let signature: string | undefined;
      if (window.Telegram?.WebApp) {
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
      return { success: true, signature };
    } else {
      let signature: string | undefined;
      if (window.Telegram?.WebApp) {
        signature = await withdrawTelegram();
      } else {
        if (!publicKey || !sendTransaction) {
          throw new Error("Wallet is not connected.");
        }
        signature = await withdrawSolana(publicKey, parseFloat(amount));
      }
      if (!signature) {
        throw new Error("Withdraw transaction failed.");
      }

      return { success: true, signature };
    }
  };

  return { runTransaction };
};
