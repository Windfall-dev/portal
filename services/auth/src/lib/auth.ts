import jwt from "jsonwebtoken";

export interface AuthTokenPayload {
  userId: string;
  provider: string;
}

const secret = process.env.AUTH_SECRET!;

export function createAccessToken(payload: AuthTokenPayload): string {
  // console.log("AUTH_SECRET:", secret);
  // TODO:キーを環境変数で取得する AWSだと読み込めない
  return jwt.sign(payload, "36rruVrNSN7ybXKLprhtGbXK6j8HSfGvzE0bRMaNx0Q=");
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, secret) as AuthTokenPayload;
  return decoded;
}
