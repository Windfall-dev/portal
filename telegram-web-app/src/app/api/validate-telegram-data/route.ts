import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { env } from "@/env";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { initData } = body;

  if (!initData) {
    return NextResponse.json(
      { error: "No initData provided" },
      { status: 400 }
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
    .update(env.BOT_TOKEN)
    .digest();
  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (calculatedHash === hash) {
    const user = JSON.parse(params.get("user") || "{}");
    return NextResponse.json({
      valid: true,
      user: user,
    });
  } else {
    return NextResponse.json({ valid: false }, { status: 403 });
  }
}
