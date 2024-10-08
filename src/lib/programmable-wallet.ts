import { initiateUserControlledWalletsClient } from "@circle-fin/user-controlled-wallets";
import { v4 as uuidv4 } from "uuid";

const circleApiKey = process.env.CIRCLE_API_KEY || "";
const circleApiBaseUrl = process.env.CIRCLE_API_BASE_URL;
const circleApiUrl = `${circleApiBaseUrl}/v1/w3s`;

export const circleUserSdk = initiateUserControlledWalletsClient({
  apiKey: circleApiKey,
  baseUrl: circleApiBaseUrl,
});

export async function checkIsUserCreated(userId: string) {
  const userCheckResponse = await fetch(`${circleApiUrl}/users/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${circleApiKey}`,
    },
  });
  return userCheckResponse.ok;
}

export async function createUser(userId: string) {
  const userCreateResponse = await fetch(`${circleApiUrl}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${circleApiKey}`,
    },
    body: JSON.stringify({ userId }),
  });
  if (!userCreateResponse.ok) {
    throw new Error("Failed to create user");
  }
}

export async function getUserTokenAndEncryptionKey(userId: string): Promise<{
  userToken: string;
  encryptionKey: string;
}> {
  const tokenResponse = await fetch(`${circleApiUrl}/users/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${circleApiKey}`,
    },
    body: JSON.stringify({ userId }),
  });

  if (!tokenResponse.ok) {
    throw new Error("Failed to fetch user token");
  }

  const { data } = await tokenResponse.json();
  return data;
}

export async function getWallet(userToken: string) {
  const res = await fetch(`${circleApiUrl}/wallets`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${circleApiKey}`,
      "Content-Type": "application/json",
      "X-User-Token": userToken,
    },
  });

  const {
    data: { wallets },
  } = await res.json();

  if (wallets.length === 0) {
    return;
  }
  const [{ id, address }] = wallets;

  const result = {
    id,
    address,
  };

  return result;
}

export async function getInitializeChallengeId(
  userToken: string,
): Promise<string> {
  const challengeResponse = await fetch(`${circleApiUrl}/user/initialize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${circleApiKey}`,
      "X-User-Token": userToken,
    },
    body: JSON.stringify({
      idempotencyKey: uuidv4(),
      blockchains: ["SOL-DEVNET"],
    }),
  });

  if (!challengeResponse.ok) {
    throw new Error("Failed to fetch challenge");
  }

  const {
    data: { challengeId },
  } = await challengeResponse.json();
  return challengeId;
}
