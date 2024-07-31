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

export async function setIsProgrammableWalletsUserCreated(userId: string) {
  const users = await ensureTableExists();
  return await db
    .update(users)
    .set({ id: userId, isProgrammableWalletsUserCreated: true })
    .returning();
}

export async function setIsProgrammableWalletsWalletCreated(userId: string) {
  const users = await ensureTableExists();
  return await db
    .update(users)
    .set({ id: userId, isProgrammableWalletsWalletCreated: true })
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
        is_programmable_wallets_user_created BOOLEAN DEFAULT FALSE,
        is_programmable_wallets_wallet_created BOOLEAN DEFAULT FALSE
      );`;
  }

  const table = pgTable("User", {
    id: uuid("id").primaryKey().defaultRandom(),
    telegramId: varchar("telegram_id", { length: 64 }).notNull(),
    isProgrammableWalletsUserCreated: boolean(
      "is_programmable_wallets_user_created",
    ).default(false),
    isProgrammableWalletsWalletCreated: boolean(
      "is_programmable_wallets_wallet_created",
    ).default(false),
  });

  return table;
}
