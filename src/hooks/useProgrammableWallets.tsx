import { useContext } from "react";

import { ProgrammableWalletsContext } from "@/contexts/ProgrammableWalletsContext";

export function useProgrammableWallets() {
  const context = useContext(ProgrammableWalletsContext);
  if (context === undefined) {
    throw new Error(
      "useProgrammableWallets must be used within a ProgrammableWalletsProvider",
    );
  }
  return context;
}
