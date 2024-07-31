"use client";

import { ProgrammableWalletsProvider } from "./ProgrammableWalletProvider";

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ProgrammableWalletsProvider>{children}</ProgrammableWalletsProvider>;
}
