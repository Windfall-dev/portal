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

export function SolanaWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setAccessToken } = useAuth();
  const { isEnabled: telegramEnabled } = useTelegram();

  const autoSignIn = useCallback(
    async (adapter: Adapter) => {
      if (adapter.name == "Mobile Wallet Adapter") {
        return false;
      }
      if (!("signIn" in adapter)) {
        return true;
      }
      const input = await createSignInData();
      const output = await adapter.signIn(input);
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
      ).then((response) => response.json());
      console.log("response", response);
      const { access_token: accessToken } = response;
      setAccessToken(accessToken);
      return false;
    },
    [setAccessToken],
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
