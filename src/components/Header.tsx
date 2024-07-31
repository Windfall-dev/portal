"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { useProgrammableWallet } from "@/hooks/useProgrammableWallet";

// import { truncate } from "@/lib/utils";

export function Header() {
  const { isLoading, isEnabled, isCreating, walletAddress, create, signIn } =
    useProgrammableWallet();

  return (
    <div className="bg-gray-200 p-4 flex justify-between items-center">
      <h1 className="text-lg font-bold">Windfall</h1>
      <div>
        {isLoading && (
          <Button variant="secondary" disabled>
            Loading...
          </Button>
        )}
        {!isLoading && (
          <>
            {!isEnabled && (
              <>
                <Button>Connect Wallet</Button>
              </>
            )}
            {isEnabled && (
              <>
                {!walletAddress && (
                  <Button
                    variant={!isCreating ? "default" : "secondary"}
                    disabled={isCreating}
                    onClick={create}
                  >
                    {!isCreating ? "Create Wallet" : "Creating..."}
                  </Button>
                )}
                {walletAddress && <Button onClick={signIn}>Sign In</Button>}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
