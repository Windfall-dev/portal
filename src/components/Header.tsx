"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import nacl from "tweetnacl";

import SeasonResult from "@/components/SeasonResult";
import Toptab from "@/components/Toptab";
import { Button } from "@/components/ui/button";
import { useProgrammableWallet } from "@/hooks/useProgrammableWallet";
import { useTelegram } from "@/hooks/useTelegram";
import { truncate } from "@/lib/utils";

nacl.sign.detached.verify;
export function Header() {
  const telegram = useTelegram();
  const programmableWallet = useProgrammableWallet();

  const pathname = usePathname();

  return (
    <div className="flex flex-col">
      <div
        className={`flex items-center justify-between p-3 ${pathname !== "/game/play" ? "bg-gray-200" : "absolute left-0 top-0 z-10 w-full"}`}
      >
        <Link href="/">
          <Image
            src="/windfall_logo_h.png"
            alt="Windfall"
            width={150}
            height={40}
          />
        </Link>
        <SeasonResult />
        <div>
          {telegram.isLoading && !telegram.isEnabled && (
            <Button disabled>Detecting Platform......</Button>
          )}
          {!telegram.isLoading && telegram.isEnabled && (
            <>
              {programmableWallet.isLoading && (
                <Button disabled>Loading Wallet...</Button>
              )}
              {!programmableWallet.isLoading && (
                <>
                  {!programmableWallet.walletAddress && (
                    <Button
                      disabled={programmableWallet.isCreating}
                      onClick={programmableWallet.createWallet}
                    >
                      {!programmableWallet.isCreating
                        ? "Create Wallet"
                        : "Creating Wallet..."}
                    </Button>
                  )}
                  {programmableWallet.walletAddress && (
                    <Button variant="standard" className="bg-wf-orange">
                      {`${truncate(programmableWallet.walletAddress, 12)}`}
                    </Button>
                  )}
                </>
              )}
            </>
          )}
          {!telegram.isLoading && !telegram.isEnabled && <WalletMultiButton />}
        </div>
      </div>
      <Toptab />
    </div>
  );
}
