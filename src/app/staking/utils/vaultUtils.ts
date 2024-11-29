import { AnchorProvider, Program, setProvider } from "@coral-xyz/anchor";
import { NATIVE_MINT } from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";

import { Vault } from "../vault";
import idl from "../vault.json";

// Using `idl_object` avoids these type mismatch errors.
const idl_string = JSON.stringify(idl);
const idl_object = JSON.parse(idl_string);

export function getConnection() {
  return new Connection("https://api.devnet.solana.com");
}

export function getVaultType() {
  return new PublicKey("AS2UQURPKTpjiyV5eSTQwRtCns2Lya3sgUKLfSCca8q8");
}

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
