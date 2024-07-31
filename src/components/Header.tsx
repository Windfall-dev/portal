"use client";

import { signOut, useSession } from "next-auth/react";
import React from "react";
import nacl from "tweetnacl";

import { Button } from "@/components/ui/button";
import { useProgrammableWallet } from "@/hooks/useProgrammableWallet";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";
import { truncate } from "@/lib/utils";

nacl.sign.detached.verify;
export function Header() {
  const programmableWallet = useProgrammableWallet();
  const solanaWallet = useSolanaWallet();

  const { status } = useSession();
  console.log("status", status);

  return (
    <div className="bg-gray-200 p-4 flex justify-between items-center">
      <h1 className="text-lg font-bold">Windfall</h1>
      <div>
        {programmableWallet.isLoading && (
          <Button variant="secondary" disabled>
            Loading...
          </Button>
        )}
        {!programmableWallet.isLoading && (
          <>
            {!programmableWallet.isEnabled && (
              <>
                {!solanaWallet.walletAddress && (
                  <Button onClick={solanaWallet.openConnectModal}>
                    Connect Wallet
                  </Button>
                )}
                {solanaWallet.walletAddress && (
                  <>
                    {status === "unauthenticated" && (
                      <Button
                        onClick={solanaWallet.signIn}
                      >{`Sign In with ${truncate(solanaWallet.walletAddress, 6)}`}</Button>
                    )}
                    {status === "authenticated" && (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          solanaWallet.disconnect();
                          signOut();
                        }}
                      >
                        {`${truncate(solanaWallet.walletAddress, 12)}`}
                      </Button>
                    )}
                  </>
                )}
              </>
            )}
            {programmableWallet.isEnabled && (
              <>
                {!programmableWallet.walletAddress && (
                  <Button
                    variant={
                      !programmableWallet.isCreating ? "default" : "secondary"
                    }
                    disabled={programmableWallet.isCreating}
                    onClick={programmableWallet.create}
                  >
                    {!programmableWallet.isCreating
                      ? "Create Wallet"
                      : "Creating..."}
                  </Button>
                )}
                {programmableWallet.walletAddress && (
                  <>
                    {status === "unauthenticated" && (
                      <Button onClick={programmableWallet.signIn}>
                        Sign In
                      </Button>
                    )}
                    {status === "authenticated" && (
                      <Button variant="secondary">
                        {truncate(solanaWallet.walletAddress, 12)}
                      </Button>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
