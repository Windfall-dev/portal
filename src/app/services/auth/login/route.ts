import { NextApiRequest, NextApiResponse } from "next";

import { handleLogin } from "../../../../../services/auth/src/lib";

export default function loginHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { provider, credential } = req.body;

    if (typeof provider !== "string" || typeof credential !== "string") {
      return res.status(400).json({ error: "Invalid provider or credential" });
    }

    try {
      handleLogin(provider, credential);
      res
        .status(200)
        .json({ message: `Login handled for provider: ${provider}` });
    } catch (error: unknown) {
      const err = error as Error;
      const errorMessage = err.message || "An unexpected error occurred";
      res.status(400).json({ error: errorMessage });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
