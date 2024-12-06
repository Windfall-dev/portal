"use client";

import React, { ReactNode, createContext, useContext, useState } from "react";

import { TOKENS, Token } from "../utils/vaultUtils";

interface VaultContextType {
  selectedVault: Token;
  setSelectedVault: (vault: Token) => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: ReactNode }) {
  const [selectedVault, setSelectedVault] = useState<Token>(TOKENS.wSOL);

  return (
    <VaultContext.Provider value={{ selectedVault, setSelectedVault }}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVaultContext() {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error("useVaultContext must be used within a VaultProvider");
  }
  return context;
}
