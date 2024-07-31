import { stringify } from "querystring";

export const signInMessage = "Sign in to Windfall";

export async function signIn(walletAddress: string, signature: string) {
  // const csrfApiResponse = await fetch("api/auth/csrf");
  // const { csrfToken } = await csrfApiResponse.json();
  await fetch(`api/auth/callback/credentials?`, {
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: stringify({
      walletAddress,
      signature,
      // csrfToken,
    }),
    method: "POST",
  });
}
