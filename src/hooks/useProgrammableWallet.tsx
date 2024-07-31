import { useContext } from "react";

import { ProgrammableWalletContext } from "@/contexts/ProgrammableWalletContext";

export function useProgrammableWallet() {
  const context = useContext(ProgrammableWalletContext);
  if (context === undefined) {
    throw new Error(
      "useProgrammableWallets must be used within a ProgrammableWalletsProvider",
    );
  }
  return context;
}
