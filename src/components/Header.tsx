"use client";

import React, { useState } from "react";

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

  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="bg-gray-200 p-4 flex justify-between items-center">
      <h1 className="text-lg font-bold">Windfall</h1>
      {isLoading && (
        <Button variant="secondary" disabled>
          Loading...
        </Button>
      )}
      {!isLoading && (
        <>
          {!isSignedIn && (
            <Button variant="destructive" disabled>
              Telegram Not Detected
            </Button>
          )}
          {isSignedIn && (
            <>
              {!walletAddress && (
                <Button
                  variant={!isCreating ? "default" : "secondary"}
                  disabled={isCreating}
                  onClick={async () => {
                    if (!sdk) {
                      throw new Error("SDK not initialized");
                    }
                    const challengeId = await getInitializeChallengeId();
                    sdk.execute(challengeId, async () => {
                      setIsCreating(true);
                      const intervalId = setInterval(async () => {
                        try {
                          const walletAddress =
                            await setProgrammableWalletsWallet();
                          clearInterval(intervalId);
                          setIsCreating(false);
                          setWalletAddress(walletAddress);
                        } catch (error) {
                          console.error("Error setting wallet address:", error);
                        }
                      }, 1000);
                    });
                  }}
                >
                  {!isCreating ? "Create Wallet" : "Creating..."}
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
