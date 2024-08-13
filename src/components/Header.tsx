"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import nacl from "tweetnacl";

import { Button } from "@/components/ui/button";
import { useProgrammableWallet } from "@/hooks/useProgrammableWallet";
import { useTelegram } from "@/hooks/useTelegram";
import { truncate } from "@/lib/utils";

import Toptab from "./Toptab";

nacl.sign.detached.verify;
export function Header() {
  const telegram = useTelegram();
  const programmableWallet = useProgrammableWallet();

  const pathname = usePathname();

  return (
    <div className="flex flex-col">
      <div
        className={`p-3 flex justify-between items-center ${pathname !== "/game/play" ? "bg-gray-200" : "absolute top-0 left-0 w-full z-10"}`}
      >
        <Link href="/">
          <Image
            src="/windfall_logo_h.png"
            alt="Windfall"
            width={150}
            height={40}
          />
        </Link>
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
