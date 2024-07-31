import crypto from "crypto";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import {
  createUserByTelegramId,
  getUserByTelegramId,
  setIsProgrammableWalletsCreated,
} from "@/lib/db";
import {
  createUser,
  getUserTokenAndEncryptionKey,
} from "@/lib/programmable-wallets";
import { TelegramUser } from "@/types/telegram-user";

export const { handlers, auth } = NextAuth({
  providers: [
    Credentials({
      async authorize({ initData: _initData }) {
        const initData = _initData as string;
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
          .update(process.env.TELEGRAM_BOT_TOKEN || "")
          .digest();
        const calculatedHash = crypto
          .createHmac("sha256", secretKey)
          .update(dataCheckString)
          .digest("hex");
        if (calculatedHash !== hash) {
          return null;
        }
        const { id: _telegramId }: TelegramUser = JSON.parse(
          params.get("user") || "{}",
        );
        if (!_telegramId) {
          return null;
        }
        const telegramId = _telegramId.toString();
        let [user] = await getUserByTelegramId(telegramId);
        if (!user) {
          [user] = await createUserByTelegramId(telegramId);
        }
        const userId = user.id.toString();
        if (!user.isProgrammableWalletsCreated) {
          await createUser(userId);
          await setIsProgrammableWalletsCreated(userId);
        }
        const { userToken, encryptionKey } =
          await getUserTokenAndEncryptionKey(userId);
        return {
          ...user,
          id: userId,
          programmableWallets: { userToken, encryptionKey },
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token = { ...token, user };
      }
      return token;
    },
    async session({ session, token }) {
      session = { ...session, ...token };
      return session;
    },
  },
});
