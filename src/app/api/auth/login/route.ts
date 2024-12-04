import { NextRequest, NextResponse } from "next/server";

import { handleLogin } from "../../../../../services/auth/src/handler";

export async function POST(req: NextRequest) {
  try {
    const { provider, credential } = await req.json();

    if (typeof provider !== "string" || typeof credential !== "string") {
      throw new Error("Invalid provider or credential");
    }

    console.log("Provider:", provider);
    console.log("Credential:", credential);

    const accessToken = handleLogin(provider, credential);

    return NextResponse.json({
      accessToken: accessToken,
    });
  } catch (error: unknown) {
    console.error("Error in API:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred" },
      { status: 400 },
    );
  }
}
