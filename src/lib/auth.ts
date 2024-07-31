import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { stringify } from "querystring";

// import { stringify } from "querystring";

export const signInMessage = "Sign in to Windfall";

export const { handlers, auth } = NextAuth({
  providers: [
    Credentials({
      async authorize({ signature }) {
        console.log("signature", signature);
        return {
          id: "1",
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

export async function signIn(signature: string) {
  const csrfApiResponse = await fetch("api/auth/csrf");
  const { csrfToken } = await csrfApiResponse.json();
  await fetch(`api/auth/callback/credentials?`, {
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: stringify({
      initData: signature,
      csrfToken,
    }),
    method: "POST",
  });
}
