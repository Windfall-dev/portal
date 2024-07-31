import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
import { createContext } from "react";

interface ProgrammableWalletsContextProps {
  sdk?: W3SSdk;
  walletAddress: string;
  setWalletAddress: (address: string) => void;
}

export const ProgrammableWalletsContext = createContext<
  ProgrammableWalletsContextProps | undefined
>(undefined);
