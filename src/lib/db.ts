import { eq } from "drizzle-orm";
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function getUser(walletAddress: string) {
  const users = await ensureUserTableExists();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.walletAddress, walletAddress));
  if (user) {
    return user;
  }
}

export async function createUser(walletAddress: string) {
  const users = await ensureUserTableExists();
  const [user] = await db.insert(users).values({ walletAddress }).returning();
  return user;
}

async function ensureUserTableExists() {
  const result = await client`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'User'
    );`;

  if (!result[0].exists) {
    await client`
      CREATE TABLE "User" (
        id: uuid("id").primaryKey().defaultRandom(),
        wallet_address VARCHAR(64) NOT NULL
      );`;
  }
  const table = pgTable("User", {
    id: uuid("id").primaryKey().defaultRandom(),
    walletAddress: varchar("wallet_address", { length: 64 }).notNull(),
  });
  return table;
}

export async function getTelegram(telegramId: string) {
  const telegrams = await ensureTelegramTableExists();
  const [telegram] = await db
    .select()
    .from(telegrams)
    .where(eq(telegrams.telegramId, telegramId));
  if (telegram) {
    return telegram;
  }
}

export async function createTelegram(telegramId: string) {
  const telegrams = await ensureTelegramTableExists();
  const [telegram] = await db
    .insert(telegrams)
    .values({ telegramId })
    .returning();
  return telegram;
}

async function ensureTelegramTableExists() {
  const result = await client`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'Telegram'
    );`;

  if (!result[0].exists) {
    await client`
      CREATE TABLE "Telegram" (
        id: uuid("id").primaryKey().defaultRandom(),
        telegram_id: VARCHAR(64) NOT NULL
      );`;
  }
  const table = pgTable("Telegram", {
    id: uuid("id").primaryKey().defaultRandom(),
    telegramId: varchar("telegram_id", { length: 64 }).notNull(),
  });
  return table;
}
