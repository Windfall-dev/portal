"use client";

import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
import { useEffect, useRef, useState } from "react";

import * as actions from "@/app/actions";
import { ProgrammableWalletContext } from "@/contexts/ProgrammableWalletContext";
import { useAuth } from "@/hooks/useAuth";
import { useTelegram } from "@/hooks/useTelegram";

// API通信のレスポンスの型を定義
interface ApiResponse {
  ok: boolean;
  points: number;
  username: string;
}

// API通信
async function communicateWithAPI(
  token: string,
  userId: string,
  userName: string,
): Promise<ApiResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FAST_API_URL}/api/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          user_id: userId,
          user_name: userName,
        }),
      },
    );

    if (!response.ok) {
      throw new Error("API communication failed");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error communicating with API:", error);
    throw error;
  }
}

export function ProgrammableWalletsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isEnabled: telegramEnabled } = useTelegram();
  const { accessToken, username, setUserId } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const initialized = useRef(false);
  const [sdk, setSdk] = useState<W3SSdk>();
  const [userToken, setUserToken] = useState("");
  const [, setEncryptionKey] = useState("");
  const [walletId, setWalletId] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [points, setPoints] = useState(0);

  useEffect(() => {
    (async () => {
      if (!accessToken || !telegramEnabled) {
        return;
      }
      if (!initialized.current) {
        console.log("ProgrammableWalletsProvider: init");
        initialized.current = true;
        setIsLoading(true);
        const { userToken, encryptionKey, walletId, walletAddress } =
          await actions.getProgrammableWallet(accessToken);
        const sdk = new W3SSdk({
          appSettings: {
            appId: process.env.NEXT_PUBLIC_CIRCLE_APP_ID || "",
          },
        });
        sdk.setAuthentication({
          userToken,
          encryptionKey,
        });
        // APIとの通信を追加
        try {
          // console.log(accessToken)
          // console.log(walletAddress)
          const apiResponse = await communicateWithAPI(
            accessToken,
            walletAddress,
            username,
          );
          if (apiResponse.ok) {
            setPoints(apiResponse.points);
          }
        } catch (error) {
          console.error("Error in API communication:", error);
        }
        setUserToken(userToken);
        setUserId(walletAddress);
        setEncryptionKey(encryptionKey);
        setWalletId(walletId);
        setWalletAddress(walletAddress);
        setSdk(sdk);
        setIsLoading(false);
      }
    })();
  }, [accessToken, setUserId, telegramEnabled, username]);

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

  async function signMessage(message: string) {
    if (!userToken) {
      throw new Error("User token is not defined");
    }
    if (!walletId) {
      throw new Error("Wallet id is not defined");
    }
    if (!sdk) {
      throw new Error("SDK is not defined");
    }
    const challengeId = await actions.getSignMessageChallengeId(
      userToken,
      walletId,
      message,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sdk.execute(challengeId, async (_, result: any) => {
      console.log("result.data.signature: ", result.data.signature);
    });
  }

  async function signTransaction(transaction: string) {
    if (!userToken) {
      throw new Error("User token is not defined");
    }
    if (!walletId) {
      throw new Error("Wallet id is not defined");
    }
    if (!sdk) {
      throw new Error("SDK is not defined");
    }
    const challengeId = await actions.getSignTransactionChallengId(
      userToken,
      walletId,
      transaction,
    );
    const signedTransaction = await new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sdk.execute(challengeId, (error: any, result: any) => {
        if (error) {
          return reject(error);
        }
        if (result && result.data && result.data.signedTransaction) {
          resolve(result.data.signedTransaction);
        } else {
          reject(new Error("Signed transaction not found in result"));
        }
      });
    });
    return signedTransaction as string;
  }

  return (
    <ProgrammableWalletContext.Provider
      value={{
        isLoading,
        isCreating,
        createWallet,
        walletAddress,
        signMessage,
        signTransaction,
        points,
        username,
      }}
    >
      {children}
    </ProgrammableWalletContext.Provider>
  );
}
