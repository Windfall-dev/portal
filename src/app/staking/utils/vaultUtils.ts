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
}

export const VAULT_CONFIGS: Record<string, VaultConfig> = {
  SOL: {
    vaultName: "SOL",
    vaultType: "AS2UQURPKTpjiyV5eSTQwRtCns2Lya3sgUKLfSCca8q8",
    mint: NATIVE_MINT.toString(),
  },
  tBTC: {
    vaultName: "tBTC",
    vaultType: "Placeholder",
    mint: "Placeholder",
  },
} as const;

export function getConnection() {
  return new Connection("https://api.devnet.solana.com");
}

export const getVaultType = (vaultName: string) => {
  const config = VAULT_CONFIGS[vaultName];
  if (!config) {
    throw new Error(`No vault configuration found for ${vaultName}`);
  }
  console.log("config: ", config);
  return new PublicKey(config.vaultType);
};

export function getMint() {
  return new PublicKey(NATIVE_MINT);
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
