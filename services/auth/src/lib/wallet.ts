import {
  SolanaSignInInput,
  SolanaSignInOutput,
} from "@solana/wallet-standard-features";
import { verifySignIn } from "@solana/wallet-standard-util";

import { base64ToUint8Array } from "./utils";

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
