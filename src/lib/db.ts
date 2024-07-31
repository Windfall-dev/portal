import { eq } from "drizzle-orm";
import { boolean, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function getUserByTelegramId(telegramId: string) {
  const users = await ensureTableExists();
  return await db.select().from(users).where(eq(users.telegramId, telegramId));
}

export async function createUserByTelegramId(telegramId: string) {
  const users = await ensureTableExists();
  return await db.insert(users).values({ telegramId }).returning();
}

export async function setProgrammableWalletsIsUserCreated(userId: string) {
  const users = await ensureTableExists();
  return await db
    .update(users)
    .set({ id: userId, programmableWalletsIsUserCreated: true })
    .returning();
}

export async function setProgrammableWalletsWalletAddress(
  userId: string,
  walletAddress: string,
) {
  const users = await ensureTableExists();
  return await db
    .update(users)
    .set({ id: userId, programmableWalletsWalletAddress: walletAddress })
    .returning();
}

async function ensureTableExists() {
  const result = await client`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'User'
    );`;

  if (!result[0].exists) {
    await client`
      CREATE TABLE "User" (
        id uuid DEFAULT gen_random_uuid(),
        telegram_id VARCHAR(64) NOT NULL,
        programmable_wallets_is_user_created BOOLEAN DEFAULT FALSE,
        programmable_wallets_wallet_address VARCHAR(64)
      );`;
  }

  const table = pgTable("User", {
    id: uuid("id").primaryKey().defaultRandom(),
    telegramId: varchar("telegram_id", { length: 64 }).notNull(),
    programmableWalletsIsUserCreated: boolean(
      "programmable_wallets_is_user_created",
    ).default(false),
    programmableWalletsWalletAddress: varchar(
      "programmable_wallets_wallet_address",
      {
        length: 64,
      },
    ),
  });

  return table;
}
