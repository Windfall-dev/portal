import { skipCSRFCheck } from "@auth/core";
import bs58 from "bs58";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import nacl from "tweetnacl";
import { decodeUTF8 } from "tweetnacl-util";

import { signInMessage } from "@/lib/auth";
import * as db from "@/lib/db";

export const {
  handlers: { GET, POST },
} = NextAuth({
  providers: [
    Credentials({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async authorize({ walletAddress, signature }: any) {
        const messageBytes = decodeUTF8(signInMessage);
        const walletAddressBuffer = bs58.decode(walletAddress);
        const signatureBuffer = bs58.decode(signature);
        const result = nacl.sign.detached.verify(
          messageBytes,
          signatureBuffer,
          walletAddressBuffer,
        );
        if (!result) {
          return null;
        }

        let user = await db.getUser(walletAddress);
        if (!user) {
          user = await db.createUser(walletAddress);
        }
        return user;
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
  skipCSRFCheck,
});
