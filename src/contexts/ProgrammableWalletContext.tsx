import { createContext } from "react";

interface ProgrammableWalletContextProps {
  isLoading: boolean;
  isCreating: boolean;
  walletAddress: string;
  createWallet: () => void;
  signMessage: (message: string) => void;
  signTransaction: (transaction: string) => Promise<string>;
  points: number;
  username: string;
}

export const ProgrammableWalletContext = createContext<
  ProgrammableWalletContextProps | undefined
>(undefined);
