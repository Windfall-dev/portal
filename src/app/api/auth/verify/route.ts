import { NextRequest, NextResponse } from "next/server";

import { handleVerify } from "../../../../../services/auth/src/handler";

export async function POST(req: NextRequest) {
  try {
    const { accessToken } = await req.json();

    if (typeof accessToken !== "string") {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 400 },
      );
    }

    const decoded = handleVerify(accessToken);

    return NextResponse.json({
      decoded,
    });
  } catch (error: unknown) {
    const err = error as Error;
    const errorMessage = err.message || "An unexpected error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
