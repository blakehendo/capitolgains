import { NextResponse } from "next/server";
import { sql } from "@/lib/supabase-db";

export async function GET() {
  const [result] = await sql<{ now: Date }[]>`select now()`;

  return NextResponse.json({
    status: "ok",
    now: result.now.toISOString(),
  });
}
