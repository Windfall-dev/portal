import { and, eq } from "drizzle-orm";
import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { AuthProvider } from "@/types/auth-provider";

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function getOrCreateUser(
  provider: AuthProvider,
  providerUserId: string,
) {
  let user = await getUser(provider, providerUserId);
  if (!user) {
    user = await createUser(provider, providerUserId);
  }
  return user;
}

export async function getUser(provider: AuthProvider, providerUserId: string) {
  const users = await ensureUserTableExists();
  const [user] = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.provider, provider),
        eq(users.providerUserId, providerUserId),
      ),
    );
  return user;
}

export async function createUser(
  provider: AuthProvider,
  providerUserId: string,
) {
  const users = await ensureUserTableExists();
  const [user] = await db
    .insert(users)
    .values({ provider, providerUserId })
    .returning();
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
        provider_user_id TEXT NOT NULL
      );`;
  }

  const table = pgTable("User", {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: text("provider").notNull(),
    providerUserId: varchar("provider_user_id").notNull(),
  });

  return table;
}
