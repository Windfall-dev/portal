"use client";

import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
import { useEffect, useRef, useState } from "react";

import { ProgrammableWalletContext } from "@/contexts/ProgrammableWalletContext";
import * as protectedServerActions from "@/server-actions/protected";

export function ProgrammableWalletsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const initialized = useRef(false);
  const [sdk, setSdk] = useState<W3SSdk>();
  const [userToken, setUserToken] = useState("");
  const [, setEncryptionKey] = useState("");
  const [walletId, setWalletId] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    (async () => {
      if (!initialized.current) {
        initialized.current = true;
        if (window.Telegram?.WebApp) {
          const tgWebApp = window.Telegram.WebApp;
          tgWebApp.ready();
          const initData = tgWebApp.initData;
          if (initData) {
            setIsEnabled(true);
            const { userToken, encryptionKey, walletId, walletAddress } =
              await protectedServerActions.getProgrammableWalletByTelegramInitData(
                initData,
              );
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
            setSdk(sdk);
            setWalletId(walletId);
            setWalletAddress(walletAddress);
          }
        }
        setIsLoading(false);
      }
    })();
  }, []);

  async function create() {
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
    const challengeId =
      await protectedServerActions.getInitializeChallengeId(userToken);
    sdk.execute(challengeId, async () => {
      const intervalId = setInterval(async () => {
        const wallet = await protectedServerActions.getWallet(userToken);
        if (wallet) {
          clearInterval(intervalId);
          setWalletId(wallet.id);
          setWalletAddress(wallet.address);
          setIsCreating(false);
        }
      }, 1000);
    });
  }

  return (
    <ProgrammableWalletContext.Provider
      value={{
        isEnabled,
        isLoading,
        isCreating,
        sdk,
        walletAddress,
        create,
      }}
    >
      {children}
    </ProgrammableWalletContext.Provider>
  );
}
