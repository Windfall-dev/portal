import { v4 as uuidv4 } from "uuid";

export async function checkIsUserCreated(userId: string) {
  const userCheckResponse = await fetch(
    `${process.env.CIRCLE_API_URL}/users/${userId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
      },
    },
  );
  return userCheckResponse.ok;
}

export async function createUser(userId: string) {
  const userCreateResponse = await fetch(
    `${process.env.CIRCLE_API_URL}/users`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
      },
      body: JSON.stringify({ userId }),
    },
  );
  if (!userCreateResponse.ok) {
    throw new Error("Failed to create user");
  }
}

export async function checkIsWalletCreated(userToken: string) {
  const userCheckResponse = await fetch(`${process.env.CIRCLE_API_URL}/user`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
      "X-User-Token": userToken,
    },
  });

  if (!userCheckResponse.ok) {
    throw new Error("Failed to fetch user");
  }

  const {
    data: { pinStatus },
  } = await userCheckResponse.json();
  return pinStatus === "ENABLED";
}

export async function getInitializeChallengeId(userToken: string) {
  const challengeResponse = await fetch(
    `${process.env.CIRCLE_API_URL}/user/initialize`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
        "X-User-Token": userToken,
      },
      body: JSON.stringify({
        idempotencyKey: uuidv4(),
        blockchains: ["SOL-DEVNET"],
      }),
    },
  );

  if (!challengeResponse.ok) {
    throw new Error("Failed to fetch challenge");
  }

  const {
    data: { challengeId },
  } = await challengeResponse.json();
  return challengeId;
}

export async function getUserTokenAndEncryptionKey(userId: string) {
  const tokenResponse = await fetch(
    `${process.env.CIRCLE_API_URL}/users/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
      },
      body: JSON.stringify({ userId }),
    },
  );

  if (!tokenResponse.ok) {
    throw new Error("Failed to fetch user token");
  }

  const { data } = await tokenResponse.json();
  return data;
}
