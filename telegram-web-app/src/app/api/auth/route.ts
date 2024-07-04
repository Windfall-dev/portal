import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { env } from "@/env";
import { User } from "@/types/user";

import { v4 as uuidv4 } from "uuid";

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

  if (calculatedHash !== hash) {
    return NextResponse.json({ valid: false }, { status: 403 });
  }

  let user: User = JSON.parse(params.get("user") || "{}");
  user.id = user.id.toString();

  console.log(env);

  try {
    const userCheckResponse = await fetch(
      `${env.CIRCLE_API_URL}/users/${user.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.CIRCLE_API_KEY}`,
        },
      }
    );

    if (!userCheckResponse.ok) {
      const userCreateResponse = await fetch(`${env.CIRCLE_API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.CIRCLE_API_KEY}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!userCreateResponse.ok) {
        throw new Error("Failed to create user");
      }
    }

    const tokenResponse = await fetch(`${env.CIRCLE_API_URL}/users/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.CIRCLE_API_KEY}`,
      },
      body: JSON.stringify({ userId: user.id }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to fetch user token");
    }

    const tokenData = await tokenResponse.json();

    let challengeData = null;
    const userCheckData = await userCheckResponse.json();
    if (userCheckData.data.user.pinStatus === "UNSET") {
      const challengeResponse = await fetch(
        `${env.CIRCLE_API_URL}/user/initialize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.CIRCLE_API_KEY}`,
            "X-User-Token": tokenData.data.userToken,
          },
          body: JSON.stringify({
            idempotencyKey: uuidv4(),
            blockchains: ["SOL-DEVNET"],
          }),
        }
      );

      if (!challengeResponse.ok) {
        throw new Error("Failed to fetch challenge");
      }
      challengeData = await challengeResponse.json();
    }

    const response = NextResponse.json({
      userId: user.id,
      userToken: tokenData.data.userToken,
      encryptionKey: tokenData.data.encryptionKey,
      challengeId: challengeData?.data?.challengeId,
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
