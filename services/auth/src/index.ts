import express, { Request, Response } from "express";

import { handleLogin } from "./lib";

const app = express();

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
    handleLogin(provider, credential);
    res
      .status(200)
      .send({ message: `Login handled for provider: ${provider}` });
  } catch (error: unknown) {
    const err = error as Error;
    const errorMessage = err.message || "An unexpected error occurred";
    res.status(400).send({ error: errorMessage });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Auth microservice running on port ${PORT}`);
});
