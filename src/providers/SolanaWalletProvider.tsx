import { Adapter } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { useCallback } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useTelegram } from "@/hooks/useTelegram";
import {
  createSignInData,
  endpoint,
  serialiseSIWEData,
  wallets,
} from "@/lib/solana-wallet";

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

export function SolanaWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setAccessToken, setUsername } = useAuth();
  const { isEnabled: telegramEnabled } = useTelegram();

  const autoSignIn = useCallback(
    async (adapter: Adapter) => {
      if (adapter.name == "Mobile Wallet Adapter") {
        return false;
      }
      if (!("signIn" in adapter)) {
        return true;
      }
      try {
        const input = await createSignInData();
        const output = await adapter.signIn(input);

        // output.account.address を userId として使用
        const userId = output.account.address;

        // トークン取得のためのAPI通信
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_AUTH_API_URL}/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              provider: "wallet",
              credential: serialiseSIWEData(input, output),
            }),
          },
        );

        const authData = await response.json();
        const { accessToken } = authData;
        setAccessToken(accessToken);

        // 別のAPI通信 (communicateWithAPI) を実行
        // TODO:solanaはユーザ名が取得できないので空とする
        const apiResponse = await communicateWithAPI(accessToken, userId, "");

        if (apiResponse.ok) {
          console.log("Points:", apiResponse.points);
          console.log("Username:", apiResponse.username);
          setUsername(apiResponse.username);
        }
      } catch (error) {
        console.error("Error in autoSignIn:", error);
      }
      return false;
    },
    [setAccessToken, setUsername],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={wallets}
        autoConnect={!telegramEnabled && autoSignIn}
      >
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
