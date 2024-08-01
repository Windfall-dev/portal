import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
  SolanaSignInInput,
  SolanaSignInOutput,
} from "@solana/wallet-standard-features";
import { verifySignIn } from "@solana/wallet-standard-util";
import { clusterApiUrl } from "@solana/web3.js";

import { base64ToUint8Array, uint8ArrayToBase64 } from "./utils";

const network = WalletAdapterNetwork.Devnet;
export const endpoint = clusterApiUrl(network);
export const wallets = [new PhantomWalletAdapter()];

export const createSignInData = async () => {
  const uri = window.location.href;
  const currentUrl = new URL(uri);
  const domain = currentUrl.host;
  const signInData: SolanaSignInInput = {
    domain,
    statement: `Clicking Sign or Approve only means you have proved this wallet is owned by you. This request will not trigger any blockchain transaction or cost any gas fee.`,
    version: "1",
    chainId: "devnet",
  };
  return signInData;
};

export function serialiseSIWEData(
  input: SolanaSignInInput,
  output: SolanaSignInOutput,
) {
  return JSON.stringify({
    input,
    output: {
      account: {
        ...output.account,
        address: output.account.address,
        publicKey: uint8ArrayToBase64(output.account.publicKey),
      },
      signature: uint8ArrayToBase64(output.signature),
      signedMessage: uint8ArrayToBase64(output.signedMessage),
    },
  });
}

export function deserialiseSIWEData(siweData: string) {
  const { input, output } = JSON.parse(siweData);
  return {
    input,
    output: {
      account: {
        ...output.account,
        publicKey: base64ToUint8Array(output.account.publicKey),
      },
      signature: base64ToUint8Array(output.signature),
      signedMessage: base64ToUint8Array(output.signedMessage),
    },
  };
}

export function getWalletAddressFromSIWSData(
  input: SolanaSignInInput,
  output: SolanaSignInOutput,
): string {
  const result = verifySignIn(input, output);
  if (!result) {
    throw new Error("SIWS verification failed");
  }
  return output.account.address;
}
