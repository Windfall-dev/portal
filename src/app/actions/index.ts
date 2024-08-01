"use server";

import * as db from "@/lib/db";
import * as programmableWallet from "@/lib/programmable-wallet";
import { getTelegramIdFromInitData } from "@/lib/telegram";

export async function getProgrammableWalletByTelegramInitData(
  initData: string,
) {
  const telegramId = getTelegramIdFromInitData(initData);
  let user = await db.getUser("telegram", telegramId);
  if (!user) {
    user = await db.createUser("telegram", telegramId);
  }
  const isUserCreated = await programmableWallet.checkIsUserCreated(user.id);
  if (!isUserCreated) {
    await programmableWallet.createUser(user.id);
  }
  const { userToken, encryptionKey } =
    await programmableWallet.getUserTokenAndEncryptionKey(user.id);
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
