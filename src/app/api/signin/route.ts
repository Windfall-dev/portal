import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { getUser } from "@/lib/db";
import { TelegramUser } from "@/types/telegram-user";

export async function POST(req: NextRequest) {
  const { initData } = await req.json();
  if (!initData) {
    return NextResponse.json(
      { error: "No initData provided" },
      { status: 400 },
    );
  }

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
    .update(process.env.BOT_TOKEN || "")
    .digest();
  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (calculatedHash !== hash) {
    return NextResponse.json({ valid: false }, { status: 403 });
  }

  const telegramUser: TelegramUser = JSON.parse(params.get("user") || "{}");
  const userId = telegramUser.id.toString();
  const [user] = await getUser(userId);
  console.log("user", user);

  return NextResponse.json({ ok: "ok" });
}
