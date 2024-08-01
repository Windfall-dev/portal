import { AuthProviderName } from "./auth-provider";

export interface AuthTokenPayload {
  userId: string;
  provider: AuthProviderName;
  providerUserId: string;
}
