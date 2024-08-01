import { and, eq } from "drizzle-orm";
import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

type Provider = "wallet" | "telegram";

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function getUser(provider: Provider, identifier: string) {
  const users = await ensureUserTableExists();
  const query =
    provider === "wallet"
      ? db
          .select()
          .from(users)
          .where(
            and(
              eq(users.provider, provider),
              eq(users.walletAddress, identifier),
            ),
          )
      : db
          .select()
          .from(users)
          .where(
            and(eq(users.provider, provider), eq(users.telegramId, identifier)),
          );

  const [user] = await query;
  return user;
}

export async function createUser(provider: Provider, identifier: string) {
  const users = await ensureUserTableExists();

  const values =
    provider === "wallet"
      ? { provider, walletAddress: identifier }
      : { provider, telegramId: identifier };

  const [user] = await db.insert(users).values(values).returning();
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
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider TEXT NOT NULL,
        wallet_address VARCHAR(64),
        telegram_id VARCHAR(64),
        CHECK (
          (provider = 'wallet' AND wallet_address IS NOT NULL) OR
          (provider = 'telegram' AND telegram_id IS NOT NULL)
        )
      );`;
  }

  const table = pgTable("User", {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: text("provider").notNull(),
    walletAddress: varchar("wallet_address", { length: 64 }),
    telegramId: varchar("telegram_id", { length: 64 }),
  });

  return table;
}
