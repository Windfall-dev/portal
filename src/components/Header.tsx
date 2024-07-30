"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { useTelegram } from "@/hooks/useTelegram";

export function Header() {
  const { tgWebApp } = useTelegram();

  return (
    <div className="bg-gray-200 p-4 flex justify-between items-center">
      <h1 className="text-lg font-bold">Windfall</h1>
      {!tgWebApp && (
        <Button variant="destructive">Telegram Not Detected</Button>
      )}
      {tgWebApp && <Button>Create Wallet</Button>}
    </div>
  );
}
