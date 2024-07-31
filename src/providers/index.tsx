"use client";

import { ProgrammableWalletsProvider } from "./ProgrammableWalletsProvider";
import { TelegramProvider } from "./TelegramProvider";

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TelegramProvider>
      <ProgrammableWalletsProvider>{children}</ProgrammableWalletsProvider>
    </TelegramProvider>
  );
}
