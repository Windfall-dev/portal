"use server";

import { auth } from "@/lib/auth";
import * as db from "@/lib/db";
import * as programmableWallets from "@/lib/programmable-wallets";

export async function getSessionUser() {
  const session = await auth();
  if (!session) {
    throw new Error("Failed to authenticate");
  }
  return session.user;
}

export async function getInitializeChallengeId() {
  const user = await getSessionUser();
  return await programmableWallets.getInitializeChallengeId(
    user.programmableWalletsUserToken,
  );
}

export async function setProgrammableWalletsWallet() {
  const user = await getSessionUser();
  const { address } = await programmableWallets.getWallet(
    user.programmableWalletsUserToken,
  );
  await db.setProgrammableWalletsWalletAddress(user.id, address);
  return address;
}
