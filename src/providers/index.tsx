"use client";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { SessionProvider } from "next-auth/react";

import { endpoint, wallets } from "@/lib/solana-wallet";

import { ProgrammableWalletsProvider } from "./ProgrammableWalletProvider";

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <ProgrammableWalletsProvider>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>{children}</WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </ProgrammableWalletsProvider>
    </SessionProvider>
  );
}
