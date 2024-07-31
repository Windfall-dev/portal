import crypto from "crypto";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { createUser, getUser } from "@/lib/db";
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
        const { id: _id }: TelegramUser = JSON.parse(
          params.get("user") || "{}",
        );
        if (!_id) {
          return null;
        }
        const id = _id.toString();
        let [user] = await getUser(id);
        if (!user) {
          await createUser(id);
          [user] = await getUser(id);
        }
        return { ...user, id: user.id.toString() };
      },
    }),
  ],
});
