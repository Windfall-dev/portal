"use client";

import React, { ReactNode, createContext, useContext, useState } from "react";

import { VAULT_CONFIGS, VaultConfig } from "../utils/vaultUtils";

interface VaultContextType {
  selectedVault: VaultConfig;
  setSelectedVault: (vault: VaultConfig) => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: ReactNode }) {
  const [selectedVault, setSelectedVault] = useState(VAULT_CONFIGS["SOL"]);

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
