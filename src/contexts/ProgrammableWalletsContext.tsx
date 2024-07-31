import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
import { createContext } from "react";

interface ProgrammableWalletsContextProps {
  sdk?: W3SSdk;
  isWalletCreated: boolean;
  setIsWalletCreated: (isWalletCreated: boolean) => void;
}

export const ProgrammableWalletsContext = createContext<
  ProgrammableWalletsContextProps | undefined
>(undefined);
