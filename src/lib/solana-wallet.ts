import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
  SolanaSignInInput,
  SolanaSignInOutput,
} from "@solana/wallet-standard-features";

import { uint8ArrayToBase64 } from "./utils";

export interface NetworkConfig {
  chainId: string;
  value: string;
}

export const NETWORKS: NetworkConfig[] = [
  {
    chainId: "mainnet",
    value: process.env.NODE_API_KEY
      ? process.env.NODE_API_KEY
      : "https://api.mainnet-beta.solana.com",
  },
  { chainId: "devnet", value: "https://api.devnet.solana.com" },
  { chainId: "eclipse-mainnet", value: "https://mainnetbeta-rpc.eclipse.xyz" },
  {
    chainId: "eclipse-testnet",
    value: "https://testnet.dev2.eclipsenetwork.xyz",
  },
  // { name: "zeus-mainnet", value: "" },
];

export const DEFAULT_NETWORK = NETWORKS[0];
export const wallets = [new PhantomWalletAdapter()];

export const createSignInData = async (chainId: string) => {
  const uri = window.location.href;
  const currentUrl = new URL(uri);
  const domain = currentUrl.host;
  console.log("chainId: ", chainId);

  const signInData: SolanaSignInInput = {
    domain,
    statement: `Clicking Sign or Approve only means you have proved this wallet is owned by you. This request will not trigger any blockchain transaction or cost any gas fee.`,
    version: "1",
    chainId: chainId,
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
