"use client";

// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import nacl from "tweetnacl";

import SeasonResult from "@/components/SeasonResult";
import Toptab from "@/components/Toptab";
import { Button } from "@/components/ui/button";
import { useProgrammableWallet } from "@/hooks/useProgrammableWallet";
import { useTelegram } from "@/hooks/useTelegram";
import { truncate } from "@/lib/utils";

import { CustomWalletMultiButton } from "./CustomWalletMultiButton";

nacl.sign.detached.verify;
export function Header() {
  const telegram = useTelegram();
  const programmableWallet = useProgrammableWallet();

  const pathname = usePathname();

  const [copied, setCopied] = useState(false);
  const handleCopyToClipboard = () => {
    if (programmableWallet.walletAddress) {
      navigator.clipboard
        .writeText(programmableWallet.walletAddress)
        .then(() => {
          setCopied(true); // Show "Copied!" message
          setTimeout(() => setCopied(false), 2000); // Hide after 2 seconds
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    }
  };

  return (
    <div className="flex flex-col">
      <div
        className={`flex items-center justify-between p-3 ${pathname !== "/game/play" ? "bg-gray-200" : "absolute left-0 top-0 z-10 w-full"}`}
      >
        {pathname !== "/" ? (
          <Link href="/">
            <Image
              src="/windfall_logo_h.png"
              alt="Windfall"
              width={150}
              height={40}
            />
          </Link>
        ) : (
          <SeasonResult />
        )}
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
                    <div className="relative inline-block">
                      <Button
                        variant="standard"
                        className="bg-wf-orange"
                        onClick={handleCopyToClipboard}
                      >
                        {`${truncate(programmableWallet.walletAddress, 12)}`}
                      </Button>

                      {copied && (
                        <div className="border-gray-300 absolute right-0 z-10 mt-1 w-max rounded-lg border bg-white p-2 text-sm text-black shadow-lg">
                          Copied!
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
          {!telegram.isLoading && !telegram.isEnabled && (
            <CustomWalletMultiButton
              style={{ backgroundColor: "#FF9100" }}
              className="h-7 w-20"
            />
          )}
        </div>
      </div>
      <Toptab />
    </div>
  );
}
