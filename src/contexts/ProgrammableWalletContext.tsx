import { createContext } from "react";

interface ProgrammableWalletContextProps {
  isLoading: boolean;
  isCreating: boolean;
  walletAddress: string;
  createWallet: () => void;
  signMessage: (message: string) => void;
  sendTransaction: (transaction: string) => void;
}

export const ProgrammableWalletContext = createContext<
  ProgrammableWalletContextProps | undefined
>(undefined);
