"use client";

import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
import { useEffect, useRef, useState } from "react";

import * as actions from "@/app/actions";
import { ProgrammableWalletContext } from "@/contexts/ProgrammableWalletContext";
import { useAuth } from "@/hooks/useAuth";
import { useTelegram } from "@/hooks/useTelegram";

export function ProgrammableWalletsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const telegram = useTelegram();
  const auth = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const initialized = useRef(false);
  const [sdk, setSdk] = useState<W3SSdk>();
  const [userToken, setUserToken] = useState("");
  const [, setEncryptionKey] = useState("");
  const [walletId, setWalletId] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    (async () => {
      if (!auth.accessToken || !telegram.isEnabled) {
        return;
      }
      if (!initialized.current) {
        initialized.current = true;
        setIsLoading(true);
        const { userToken, encryptionKey, walletId, walletAddress } =
          await actions.getProgrammableWallet(auth.accessToken);
        const sdk = new W3SSdk({
          appSettings: {
            appId: process.env.NEXT_PUBLIC_CIRCLE_APP_ID || "",
          },
        });
        sdk.setAuthentication({
          userToken,
          encryptionKey,
        });
        setUserToken(userToken);
        setEncryptionKey(encryptionKey);
        setWalletId(walletId);
        setWalletAddress(walletAddress);
        setSdk(sdk);
        setIsLoading(false);
      }
    })();
  }, [auth.accessToken, telegram.isEnabled]);

  async function createWallet() {
    if (!sdk) {
      throw new Error("SDK is not defined");
    }
    if (!userToken) {
      throw new Error("User token is not defined");
    }
    if (walletId || walletAddress) {
      throw new Error("Wallet is already defined");
    }
    setIsCreating(true);
    const challengeId = await actions.getInitializeChallengeId(userToken);
    sdk.execute(challengeId, async () => {
      const intervalId = setInterval(async () => {
        const wallet = await actions.getWalletByUserToken(userToken);
        if (wallet) {
          clearInterval(intervalId);
          setWalletId(wallet.id);
          setWalletAddress(wallet.address);
          setIsCreating(false);
        }
      }, 1000);
    });
  }

  function signMessage(message: string) {
    console.log("signMessage: ", message);
    throw new Error("Not implemented");
  }

  function sendTransaction(to: string, value: string, args: []) {
    console.log("sendTransaction: ", to, value, args);
    throw new Error("Not implemented");
  }

  return (
    <ProgrammableWalletContext.Provider
      value={{
        isLoading,
        isCreating,
        createWallet,
        walletAddress,
        signMessage,
        sendTransaction,
      }}
    >
      {children}
    </ProgrammableWalletContext.Provider>
  );
}
