import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
  SolanaSignInInput,
  SolanaSignInOutput,
} from "@solana/wallet-standard-features";
import { clusterApiUrl } from "@solana/web3.js";

import { uint8ArrayToBase64 } from "./utils";

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
    chainId: "mainnet",
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
