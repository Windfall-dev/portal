"use client";

import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
import { useEffect, useRef, useState } from "react";

import { ProgrammableWalletsContext } from "@/contexts/ProgrammableWalletsContext";
import { useTelegram } from "@/hooks/useTelegram";
import { getSessionUser } from "@/server-actions/protected";

export function ProgrammableWalletsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn } = useTelegram();

  const initialized = useRef(false);
  const [sdk, setSdk] = useState<W3SSdk>();
  const [isWalletCreated, setIsWalletCreated] = useState(false);

  useEffect(() => {
    (async () => {
      if (!isSignedIn) {
        return;
      }
      if (!initialized.current) {
        initialized.current = true;
        const sdk = new W3SSdk({
          appSettings: {
            appId: process.env.NEXT_PUBLIC_CIRCLE_APP_ID || "",
          },
        });
        const {
          isProgrammableWalletsWalletCreated,
          programmableWalletsUserToken,
          programmableWalletsEncryptionKey,
        } = await getSessionUser();
        sdk.setAuthentication({
          userToken: programmableWalletsUserToken,
          encryptionKey: programmableWalletsEncryptionKey,
        });
        setSdk(sdk);
        setIsWalletCreated(isProgrammableWalletsWalletCreated);
      }
    })();
  }, [isSignedIn]);

  return (
    <ProgrammableWalletsContext.Provider
      value={{ sdk, isWalletCreated, setIsWalletCreated }}
    >
      {children}
    </ProgrammableWalletsContext.Provider>
  );
}
