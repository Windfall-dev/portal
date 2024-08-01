"use server";

import { createAccessToken, verifyAccessToken } from "@/lib/auth";
import * as db from "@/lib/db";
import * as programmableWallet from "@/lib/programmable-wallet";
import {
  deserialiseSIWEData,
  getWalletAddressFromSIWSData,
} from "@/lib/solana-wallet";
import { getTelegramIdFromInitData } from "@/lib/telegram";

export async function getAccessTokenByTelegramInitData(initData: string) {
  const telegramId = await getTelegramIdFromInitData(initData);
  const user = await db.getOrCreateUser("telegram", telegramId);
  return createAccessToken({
    userId: user.id,
    provider: "telegram",
    providerUserId: telegramId,
  });
}

export async function getAccessTokenBySIWSData(siwsData: string) {
  const { input, output } = deserialiseSIWEData(siwsData);
  const walletAddress = getWalletAddressFromSIWSData(input, output);
  const user = await db.getOrCreateUser("wallet", walletAddress);
  return createAccessToken({
    userId: user.id,
    provider: "wallet",
    providerUserId: walletAddress,
  });
}

export async function getProgrammableWallet(accessToken: string) {
  const payload = verifyAccessToken(accessToken);
  if (!payload) {
    throw new Error("Invalid access token");
  }
  if (payload.provider !== "telegram") {
    throw new Error("Invalid access token provider");
  }
  const { userId } = payload;
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
