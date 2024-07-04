import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import crypto from "crypto";
import { env } from "@/env";
import { User } from "@/types/user";
import { CIRCLE_API_URL } from "@/constant";

const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        initData: { label: "Init Data", type: "text" },
      },
      authorize: async (credentials) => {
        const { initData } = credentials as { initData: string };

        if (!initData) {
          throw new Error("No initData provided");
        }

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
          .update(env.BOT_TOKEN)
          .digest();
        const calculatedHash = crypto
          .createHmac("sha256", secretKey)
          .update(dataCheckString)
          .digest("hex");

        if (calculatedHash !== hash) {
          throw new Error("Invalid hash");
        }

        const user: User = JSON.parse(params.get("user") || "{}");

        try {
          const userResponse = await fetch(`${CIRCLE_API_URL}/users`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${env.CIRCLE_API_KEY}`,
            },
            body: JSON.stringify({ userId: user.id }),
          });

          if (!userResponse.ok) {
            throw new Error("Failed to create user");
          }

          const userData = await userResponse.json();

          const tokenResponse = await fetch(`${CIRCLE_API_URL}/users/token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${env.CIRCLE_API_KEY}`,
            },
            body: JSON.stringify({ userId: user.id }),
          });

          if (!tokenResponse.ok) {
            throw new Error("Failed to fetch user token");
          }

          const tokenData = await tokenResponse.json();

          return {
            id: user.id,
            token: tokenData.token,
            ...userData,
          };
        } catch (error) {
          console.error("Error:", error);
          throw new Error("Internal Server Error");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.token = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.token = token.token;
      }
      return session;
    },
  },
  secret: env.SECRET,
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
