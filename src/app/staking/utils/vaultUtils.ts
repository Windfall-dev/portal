import { AnchorProvider, Program, setProvider } from "@coral-xyz/anchor";
import { NATIVE_MINT } from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";

import { Vault } from "../vault";
import idl from "../vault.json";

// Using `idl_object` avoids these type mismatch errors.
const idl_string = JSON.stringify(idl);
const idl_object = JSON.parse(idl_string);

export interface VaultConfig {
  vaultName: string;
  vaultType: string;
  mint: string;
  logo: string;
}

export const VAULT_CONFIGS: Record<string, VaultConfig> = {
  SOL: {
    vaultName: "SOL",
    vaultType: "AS2UQURPKTpjiyV5eSTQwRtCns2Lya3sgUKLfSCca8q8",
    mint: NATIVE_MINT.toString(),
    logo: "./icon_sol.svg",
  },
  tBTC: {
    vaultName: "tBTC",
    vaultType: "raFF1erSr2mGtH49bfELEpFfNmvBYSM5r6UU6ruAiVc",
    mint: "Placeholder",
    logo: "icon_tbtc.svg",
  },
} as const;

export function getConnection() {
  return new Connection("https://api.devnet.solana.com");
}

export const getVaultType = (vault: VaultConfig) => {
  return new PublicKey(vault.vaultType);
};

export function getMint(vault: VaultConfig) {
  return new PublicKey(vault.mint);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setupProgram(wallet: AnchorWallet | undefined) {
  if (!wallet) {
    throw new Error("Wallet not connected");
  }
  const connection = getConnection();
  const provider = new AnchorProvider(
    connection,
    wallet,
    AnchorProvider.defaultOptions(),
  );
  setProvider(provider);

  const program = new Program<Vault>(idl_object, provider);

  return { connection, provider, program };
}
