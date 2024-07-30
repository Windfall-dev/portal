"use client";

import { TelegramProvider } from "@/providers/TelegramProvider";

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <TelegramProvider>{children}</TelegramProvider>;
}
