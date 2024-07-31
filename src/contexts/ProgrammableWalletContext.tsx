import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
import { createContext } from "react";

interface ProgrammableWalletContextProps {
  isEnabled: boolean;
  isLoading: boolean;
  isCreating: boolean;
  sdk?: W3SSdk;
  walletAddress: string;
  create: () => void;
}

export const ProgrammableWalletContext = createContext<
  ProgrammableWalletContextProps | undefined
>(undefined);
