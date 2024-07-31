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

export async function setIsProgrammableWalletsWalletCreated() {
  const user = await getSessionUser();
  const isWalletCreated = await programmableWallets.checkIsWalletCreated(
    user.programmableWalletsUserToken,
  );
  if (isWalletCreated) {
    await db.setIsProgrammableWalletsWalletCreated(user.id);
  }
}
