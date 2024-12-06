import { AnchorProvider, Program, setProvider } from "@coral-xyz/anchor";
import { NATIVE_MINT } from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

import { Vault } from "../vault";
import idl from "../vault.json";

// Using `idl_object` avoids these type mismatch errors.
const idl_string = JSON.stringify(idl);
const idl_object = JSON.parse(idl_string);

export const TOKENS = {
  wSOL: {
    mint: NATIVE_MINT,
    name: "wSOL",
    symbol: "wSOL",
    vaultType: "NrdctvrG3VyAYXWMQaGCZ1h94fE5WtMKE2APHsV2a2x",
    decimals: LAMPORTS_PER_SOL,
    icon: "./icon_sol.svg",
  },
  mBTC: {
    mint: new PublicKey("CNW66qaixFkEYbJ38HEmgTUqMKHN3ZZvUDTd1oRc8f51"),
    name: "mBTC",
    symbol: "mBTC",
    vaultType: "EpgMDz4aTTtG1xYCpJPzJ68WUTx3NGvNNkcR5wai8BCi",
    decimals: 10 ** 8,
    icon: "./icon_tbtc.svg",
  },
} as const;

export type Token = (typeof TOKENS)[keyof typeof TOKENS];

export function getConnection() {
  return new Connection("https://api.devnet.solana.com");
}

export const getVaultType = (vault: Token) => {
  return new PublicKey(vault.vaultType);
};

export function getMint(vault: Token) {
  return new PublicKey(vault.mint);
}

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
