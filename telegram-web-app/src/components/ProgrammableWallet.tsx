import React, { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
import { Auth } from "@/types/auth";
import { env } from "@/env";

export interface ProgrammableWalletProps {
  auth: Auth;
}
export const ProgrammableWallet: React.FC<ProgrammableWalletProps> = ({
  auth,
}) => {
  const [sdk, setSdk] = useState<W3SSdk | null>(null);

  useEffect(() => {
    setSdk(
      new W3SSdk({
        appSettings: {
          appId: env.NEXT_PUBLIC_CIRCLE_APP_ID,
        },
      })
    );
  }, []);

  useEffect(() => {
    if (!sdk || !auth) {
      return;
    }

    sdk.setAuthentication({
      userToken: auth.userToken,
      encryptionKey: auth.encryptionKey,
    });

    if (auth.challengeId) {
      sdk.execute(auth.challengeId);
    }
  }, [sdk, auth]);

  return <div className="">Programmable Wallet</div>;
};
