import { eq } from "drizzle-orm";
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function getTelegramUser(telegramId: string) {
  const telegramUsers = await ensureTelegramUserTableExists();
  const [telegramUser] = await db
    .select()
    .from(telegramUsers)
    .where(eq(telegramUsers.telegramId, telegramId));
  if (telegramUser) {
    return telegramUser;
  }
}

export async function createTelegramUser(telegramId: string) {
  const telegramUsers = await ensureTelegramUserTableExists();
  const [telegramUser] = await db
    .insert(telegramUsers)
    .values({ telegramId })
    .returning();
  return telegramUser;
}

async function ensureTelegramUserTableExists() {
  const result = await client`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'TelegramUser'
    );`;

  if (!result[0].exists) {
    await client`
      CREATE TABLE "TelegramUser" (
        id uuid DEFAULT gen_random_uuid(),
        telegram_id VARCHAR(64) NOT NULL
      );`;
  }

  const table = pgTable("TelegramUser", {
    id: uuid("id").primaryKey().defaultRandom(),
    telegramId: varchar("telegram_id", { length: 64 }).notNull(),
  });
  return table;
}
