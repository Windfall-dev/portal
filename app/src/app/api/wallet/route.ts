import { env } from "@/env";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const userTokenFromHeader = requestHeaders.get("x-user-token");

  try {
    const res = await fetch(`${env.CIRCLE_API_URL}/wallets`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.CIRCLE_API_KEY || ""}`,
        "Content-Type": "application/json",
        "X-User-Token": userTokenFromHeader || "",
      },
    });

    const data = await res.json();

    if (data["code"]) {
      return NextResponse.json(data, { status: 500 });
    }

    const result = {
      id: data["data"]["wallets"][0].id,
      address: data["data"]["wallets"][0].address,
    };

    return NextResponse.json(result);
  } catch (e) {
    console.log(e);
    return NextResponse.json(e, { status: 500 });
  }
}
