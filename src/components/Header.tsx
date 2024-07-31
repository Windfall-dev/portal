"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import bs58 from "bs58";
import { signOut, useSession } from "next-auth/react";
import React from "react";
import nacl from "tweetnacl";

import { Button } from "@/components/ui/button";
import { useProgrammableWallet } from "@/hooks/useProgrammableWallet";
import * as auth from "@/lib/auth";

nacl.sign.detached.verify;
export function Header() {
  const {
    isLoading,
    isEnabled,
    isCreating,
    walletAddress,
    create,
    signIn: signInWithProgrammableWallet,
  } = useProgrammableWallet();

  const { setVisible } = useWalletModal();
  const { connected, publicKey, signMessage } = useWallet();
  const { data: session } = useSession();

  const signInWithSolanaWallet = async () => {
    if (!signMessage) {
      throw new Error("signMessage is not defined");
    }
    const walletAddress = publicKey.toBase58();
    const encodedMessage = new TextEncoder().encode(auth.signInMessage);
    const signatureBuffer = await signMessage(encodedMessage);
    const signature = bs58.encode(signatureBuffer);
    await auth.signIn(walletAddress, signature);
  };

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
                {!connected && (
                  <Button
                    onClick={() => {
                      setVisible(true);
                    }}
                  >
                    {!isCreating ? "Connect Wallet" : "Creating..."}
                  </Button>
                )}
                {connected && (
                  <>
                    {!session?.user.walletAddress && (
                      <Button onClick={signInWithSolanaWallet}>Sign In</Button>
                    )}
                    {session?.user.walletAddress && (
                      <Button
                        onClick={() => {
                          signOut();
                        }}
                      >
                        Sign out
                      </Button>
                    )}
                  </>
                )}
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
                {walletAddress && (
                  <>
                    {!session?.user.walletAddress && (
                      <Button onClick={signInWithProgrammableWallet}>
                        Sign In
                      </Button>
                    )}
                    {session?.user.walletAddress && <Button>Sign out</Button>}
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
