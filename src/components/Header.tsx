"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
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

  return (
    <div className="bg-gray-200 p-4 flex justify-between items-center">
      <h1 className="text-lg font-bold">Windfall</h1>
      <div>
        {telegram.isLoading && !telegram.isEnabled && (
          <Button variant="secondary" disabled>
            Detecting Platform......
          </Button>
        )}
        {!telegram.isLoading && telegram.isEnabled && (
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
        {!telegram.isLoading && !telegram.isEnabled && <WalletMultiButton />}
      </div>
    </div>
  );
}
