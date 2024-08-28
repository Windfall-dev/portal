import cors from "cors";
import express, { Request, Response } from "express";

import { handleLogin, handleVerify } from "./handler";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.status(200).send("Auth microservice");
});

app.post("/login", (req: Request, res: Response) => {
  const { provider, credential } = req.body;

  if (typeof provider !== "string" || typeof credential !== "string") {
    return res.status(400).send({ error: "Invalid provider or credential" });
  }

  try {
    const accessToken = handleLogin(provider, credential);
    res.status(200).send({ accessToken: accessToken });
  } catch (error: unknown) {
    const err = error as Error;
    const errorMessage = err.message || "An unexpected error occurred";
    res.status(400).send({ error: errorMessage });
  }
});

app.post("/verify", (req: Request, res: Response) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).send({ error: "Access token is required" });
  }

  try {
    const decoded = handleVerify(accessToken);
    res.status(200).send({ decoded });
  } catch (error: unknown) {
    const err = error as Error;
    const errorMessage = err.message || "Invalid or expired token";
    res.status(401).send({ error: errorMessage });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Auth microservice running on port ${PORT}`);
});
