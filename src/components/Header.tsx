"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { useProgrammableWallets } from "@/hooks/useProgrammableWallets";
import { useTelegram } from "@/hooks/useTelegram";
import { truncate } from "@/lib/utils";
import {
  getInitializeChallengeId,
  setProgrammableWalletsWallet,
} from "@/server-actions/protected";

export function Header() {
  const { isLoading, isSignedIn } = useTelegram();
  const { sdk, walletAddress, setWalletAddress } = useProgrammableWallets();

  return (
    <div className="bg-gray-200 p-4 flex justify-between items-center">
      <h1 className="text-lg font-bold">Windfall</h1>
      {isLoading && <Button variant="secondary">Loading...</Button>}
      {!isLoading && (
        <>
          {!isSignedIn && (
            <Button variant="destructive">Telegram Not Detected</Button>
          )}
          {isSignedIn && (
            <>
              {!walletAddress && (
                <Button
                  onClick={async () => {
                    if (!sdk) {
                      throw new Error("SDK not initialized");
                    }
                    const challengeId = await getInitializeChallengeId();
                    sdk.execute(challengeId, async () => {
                      const walletAddress =
                        await setProgrammableWalletsWallet();
                      setWalletAddress(walletAddress);
                    });
                  }}
                >
                  Create Wallet
                </Button>
              )}
              {walletAddress && (
                <Button variant="secondary">
                  {truncate(walletAddress, 12)}
                </Button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
