import { Adapter } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { useCallback } from "react";

import * as actions from "@/app/actions";
import { useAuth } from "@/hooks/useAuth";
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
  const autoSignIn = useCallback(
    async (adapter: Adapter) => {
      if (!("signIn" in adapter)) {
        throw new Error("Adapter does not support sign in");
      }
      const input = await createSignInData();
      const output = await adapter.signIn(input);

      console.log("output", output);
      const accessToken = await actions.getAccessTokenBySIWSData(
        serialiseSIWEData(input, output),
      );
      setAccessToken(accessToken);
      return false;
    },
    [setAccessToken],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={autoSignIn}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
