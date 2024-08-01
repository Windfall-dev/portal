"use client";

import { AuthProvider } from "./AuthProvider";
import { ProgrammableWalletsProvider } from "./ProgrammableWalletProvider";
import { SolanaWalletProvider } from "./SolanaWalletProvider";
import { TelegramProvider } from "./TelegramProvider";

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <TelegramProvider>
        <ProgrammableWalletsProvider>
          <SolanaWalletProvider>{children}</SolanaWalletProvider>
        </ProgrammableWalletsProvider>
      </TelegramProvider>
    </AuthProvider>
  );
}
