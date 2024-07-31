import crypto from "crypto";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import * as db from "@/lib/db";
import * as programmableWallets from "@/lib/programmable-wallets";
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
        let [user] = await db.getUserByTelegramId(telegramId);
        if (!user) {
          [user] = await db.createUserByTelegramId(telegramId);
        }
        const userId = user.id.toString();
        if (!user.programmableWalletsIsUserCreated) {
          const isUserCreated =
            await programmableWallets.checkIsUserCreated(userId);
          if (!isUserCreated) {
            await programmableWallets.createUser(userId);
          }
          await db.setProgrammableWalletsIsUserCreated(userId);
          user.programmableWalletsIsUserCreated = true;
        }
        const { userToken, encryptionKey } =
          await programmableWallets.getUserTokenAndEncryptionKey(userId);

        console.log("user", user);

        if (!user.programmableWalletsWalletAddress) {
          const isWalletCreated =
            await programmableWallets.checkIsWalletCreated(userToken);
          if (isWalletCreated) {
            const { address } = await programmableWallets.getWallet(userToken);
            await db.setProgrammableWalletsWalletAddress(userId, address);
            user.programmableWalletsWalletAddress = address;
          }
        }

        return {
          ...user,
          id: userId,
          programmableWalletsUserToken: userToken,
          programmableWalletsEncryptionKey: encryptionKey,
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
