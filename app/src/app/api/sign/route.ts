import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { walletId, message } = body;

  if (!walletId || !message) {
    return NextResponse.json(
      { error: "walletId and message are required" },
      { status: 400 }
    );
  }

  const userToken = request.headers.get("x-user-token");
  if (!userToken) {
    return NextResponse.json(
      { error: "x-user-token header is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${env.CIRCLE_API_URL}/user/sign/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Token": userToken,
        Authorization: `Bearer ${env.CIRCLE_API_KEY}`,
      },
      body: JSON.stringify({
        walletId,
        message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json({ challengeId: data.data.challengeId });
  } catch (error) {
    console.error("Error signing message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
