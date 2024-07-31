"use client";

import { TelegramProvider } from "./TelegramProvider";

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <TelegramProvider>{children}</TelegramProvider>;
}
