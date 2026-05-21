import "server-only";
import postgres from "postgres";

const connectionString = process.env.SUPABASE_DB_POOLER_URL;

if (!connectionString) {
  throw new Error("SUPABASE_DB_POOLER_URL is required");
}

export const sql = postgres(connectionString, {
  max: 1,
  ssl: "require",
  prepare: false,
});
