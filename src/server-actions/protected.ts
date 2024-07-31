"use server";

import crypto from "crypto";

import * as programmableWallet from "@/lib/programmable-wallet";
import { TelegramUser } from "@/types/telegram-user";

export async function getProgrammableWalletByTelegramInitData(
  initData: string,
) {
  const decoded = decodeURIComponent(initData);
  const params = new URLSearchParams(decoded);
  const hash = params.get("hash");
  params.delete("hash");
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(process.env.TELEGRAM_BOT_TOKEN || "")
    .digest();
  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");
  if (calculatedHash !== hash) {
    throw new Error("Invalid hash");
  }
  const { id: _telegramId }: TelegramUser = JSON.parse(
    params.get("user") || "{}",
  );
  if (!_telegramId) {
    throw new Error("Invalid user");
  }
  const telegramId = _telegramId.toString();
  const isUserCreated = await programmableWallet.checkIsUserCreated(telegramId);
  if (!isUserCreated) {
    await programmableWallet.createUser(telegramId);
  }
  const { userToken, encryptionKey } =
    await programmableWallet.getUserTokenAndEncryptionKey(telegramId);

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
