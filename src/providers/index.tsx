"use client";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { SessionProvider } from "next-auth/react";

import { endpoint, wallets } from "@/lib/solana-wallet";

import { ProgrammableWalletsProvider } from "./ProgrammableWalletProvider";
import { TelegramProvider } from "./TelegramProvider";

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <TelegramProvider>
        <ProgrammableWalletsProvider>
          <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
              <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </ProgrammableWalletsProvider>
      </TelegramProvider>
    </SessionProvider>
  );
}
