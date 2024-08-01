"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useSession } from "next-auth/react";
import React from "react";
import nacl from "tweetnacl";

import { Button } from "@/components/ui/button";
import { useProgrammableWallet } from "@/hooks/useProgrammableWallet";
import { useTelegram } from "@/hooks/useTelegram";
import { truncate } from "@/lib/utils";

nacl.sign.detached.verify;
export function Header() {
  const telegram = useTelegram();
  const programmableWallet = useProgrammableWallet();

  const { status } = useSession();
  console.log("status", status);

  return (
    <div className="bg-gray-200 p-4 flex justify-between items-center">
      <h1 className="text-lg font-bold">Windfall</h1>
      <div>
        {telegram.isLoading && !telegram.initData && (
          <Button variant="secondary" disabled>
            Detecting Platform......
          </Button>
        )}
        {!telegram.isLoading && telegram.initData && (
          <>
            {programmableWallet.isLoading && (
              <Button variant="secondary" disabled>
                Loading Wallet...
              </Button>
            )}
            {!programmableWallet.isLoading && (
              <>
                {!programmableWallet.walletAddress && (
                  <Button
                    variant={
                      !programmableWallet.isCreating ? "default" : "secondary"
                    }
                    disabled={programmableWallet.isCreating}
                    onClick={programmableWallet.createWallet}
                  >
                    {!programmableWallet.isCreating
                      ? "Create Wallet"
                      : "Creating Wallet..."}
                  </Button>
                )}
                {programmableWallet.walletAddress && (
                  <Button variant="secondary">
                    {`${truncate(programmableWallet.walletAddress, 12)}`}
                  </Button>
                )}
              </>
            )}
          </>
        )}
        {!telegram.isLoading && !telegram.initData && <WalletMultiButton />}
      </div>
    </div>
  );
}
