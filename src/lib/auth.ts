import jwt from "jsonwebtoken";

import { AuthTokenPayload } from "@/types/auth-token-payload";

const secret = process.env.AUTH_SECRET || "";

export function createAccessToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, secret);
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, secret) as AuthTokenPayload;
  return decoded;
}
