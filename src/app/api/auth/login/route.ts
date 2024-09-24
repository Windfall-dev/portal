import { NextRequest, NextResponse } from "next/server";

import { handleLogin } from "../../../../../services/auth/src/handler";

export async function POST(req: NextRequest) {
  try {
    const { provider, credential } = await req.json();

    if (typeof provider !== "string" || typeof credential !== "string") {
      return NextResponse.json(
        { error: "Invalid provider or credential" },
        { status: 400 },
      );
    }
    console.log("provider", provider);
    console.log("credential", credential);
    const accessToken = handleLogin(provider, credential);
    return NextResponse.json({
      accessToken: accessToken,
    });
  } catch (error: unknown) {
    const err = error as Error;
    const errorMessage = err.message || "An unexpected error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
