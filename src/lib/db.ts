import { eq } from "drizzle-orm";
import { pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function getUser(telegram_id: string) {
  const users = await ensureTableExists();
  return await db
    .select()
    .from(users)
    .where(eq(users.telegram_id, telegram_id));
}

export async function createUser(telegram_id: string) {
  const users = await ensureTableExists();
  return await db.insert(users).values({ telegram_id });
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
        id SERIAL PRIMARY KEY,
        telegram_id VARCHAR(64)
      );`;
  }

  const table = pgTable("User", {
    id: serial("id").primaryKey(),
    telegram_id: varchar("telegram_id", { length: 64 }),
  });

  return table;
}
