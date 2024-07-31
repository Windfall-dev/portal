import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth } = NextAuth({
  providers: [
    Credentials({
      async authorize() {
        return {
          id: "",
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
