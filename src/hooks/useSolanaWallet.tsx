import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import bs58 from "bs58";
import { useMemo } from "react";

import * as auth from "@/lib/auth";

export function useSolanaWallet() {
  const { setVisible } = useWalletModal();
  const { publicKey, signMessage, disconnect } = useWallet();

  const walletAddress = useMemo(() => {
    if (!publicKey) {
      return "";
    }
    return publicKey.toBase58();
  }, [publicKey]);

  async function signIn() {
    if (!signMessage) {
      throw new Error("signMessage is not defined");
    }
    if (!publicKey) {
      throw new Error("publicKey is not defined");
    }

    const walletAddress = publicKey.toBase58();
    const encodedMessage = new TextEncoder().encode(auth.signInMessage);
    const signatureBuffer = await signMessage(encodedMessage);
    const signature = bs58.encode(signatureBuffer);
    await auth.signIn(walletAddress, signature);
    window.location.reload();
  }

  function openConnectModal() {
    setVisible(true);
  }

  return { openConnectModal, walletAddress, signIn, disconnect };
}
