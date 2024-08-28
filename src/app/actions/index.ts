"use server";

import * as programmableWallet from "@/lib/programmable-wallet";

export async function getProgrammableWallet(accessToken: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_AUTH_API_URL}/verify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accessToken }),
    },
  );
  const { decoded } = await response.json();
  if (!decoded) {
    throw new Error("Invalid access token");
  }
  if (decoded.provider !== "telegram") {
    throw new Error("Invalid access token provider");
  }
  const { userId } = decoded;

  const isUserCreated = await programmableWallet.checkIsUserCreated(userId);
  if (!isUserCreated) {
    await programmableWallet.createUser(userId);
  }
  const { userToken, encryptionKey } =
    await programmableWallet.getUserTokenAndEncryptionKey(userId);
  const wallet = await programmableWallet.getWallet(userToken);
  return {
    userToken,
    encryptionKey,
    walletId: wallet ? wallet.id : "",
    walletAddress: wallet ? wallet.address : "",
  };
}

export async function getWalletByUserToken(userToken: string) {
  return await programmableWallet.getWallet(userToken);
}

export async function getInitializeChallengeId(userToken: string) {
  return await programmableWallet.getInitializeChallengeId(userToken);
}

export async function getSignMessageChallengeId(
  userToken: string,
  userId: string,
  message: string,
) {
  return await programmableWallet.getSignMessageChallengeId(
    userToken,
    userId,
    message,
  );
}
