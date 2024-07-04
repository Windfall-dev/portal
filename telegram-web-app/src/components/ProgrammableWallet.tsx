import React, { useState, useCallback, useEffect } from "react";
import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
import { Auth } from "@/types/auth";
import { env } from "@/env";
import { Wallet } from "@/types/wallet";

export interface ProgrammableWalletProps {
  auth: Auth;
}
export const ProgrammableWallet: React.FC<ProgrammableWalletProps> = ({
  auth,
}) => {
  const [sdk, setSdk] = useState<W3SSdk | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [signedMessage, setSignedMessage] = useState<string | null>(null);

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
    } else {
      fetch("/api/wallet", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-user-token": auth.userToken,
        },
      }).then(async (res) => {
        const wallet = await res.json();
        setWallet(wallet);
      });
    }
  }, [sdk, auth]);

  const handleSignMessage = async () => {
    if (!sdk) {
      throw new Error("SDK not found");
    }
    if (!wallet) {
      throw new Error("Wallet not found");
    }
    const res = await fetch("/api/sign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-token": auth.userToken,
      },
      body: JSON.stringify({
        walletId: wallet.id,
        message: "Test sign for Windfall.",
      }),
    });
    const { challengeId } = await res.json();
    sdk.execute(challengeId, (error, _result) => {
      if (error) {
        console.error(`Error: ${error?.message ?? "Error!"}`);
      }
      let result = _result as any;
      setSignedMessage(result.data.signature);
    });
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Your Programmable Wallet</h2>
      {wallet && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Connected Wallet</h3>
          <p className="text-sm break-all">{wallet.address.toString()}</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={handleSignMessage}
          >
            Sign Message
          </button>
          {signedMessage && (
            <div className="mt-4 p-4 bg-green-100 rounded-md">
              <h4 className="text-lg font-semibold">Signed Message</h4>
              <p className="text-sm break-all">{signedMessage}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
