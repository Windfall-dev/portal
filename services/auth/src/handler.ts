import { createAccessToken, verifyAccessToken } from "./lib/auth";
import { getTelegramIdFromInitData } from "./lib/telegram";
import {
  deserialiseSIWEData,
  getWalletAddressFromSIWSData,
} from "./lib/wallet";

export const handleLogin = (provider: string, credential: string) => {
  if (provider === "telegram") {
    return handleTelegramLogin(credential);
  } else if (provider === "wallet") {
    return handleWalletLogin(credential);
  } else {
    throw new Error("Unknown provider");
  }
};

const handleTelegramLogin = (credential: string) => {
  const telegramId = getTelegramIdFromInitData(credential);
  return createAccessToken({
    userId: telegramId,
    provider: "telegram",
  });
};

const handleWalletLogin = (credential: string) => {
  const { input, output } = deserialiseSIWEData(credential);
  const walletAddress = getWalletAddressFromSIWSData(input, output);
  return createAccessToken({
    userId: walletAddress,
    provider: "wallet",
  });
};

export const handleVerify = (accessToken: string) => {
  return verifyAccessToken(accessToken);
};
