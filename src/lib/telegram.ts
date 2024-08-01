import crypto from "crypto";

import { TelegramUser } from "@/types/telegram-user";

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN!;

export function getTelegramIdFromInitData(initData: string) {
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
    .update(telegramBotToken)
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
  return _telegramId.toString();
}
