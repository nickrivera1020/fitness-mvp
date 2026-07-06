import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Pinged daily by a Vercel cron (see vercel.json) so the Supabase free-tier
// project never hits its 7-days-without-activity pause.
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

  const { error } = await supabase.from("tracks").select("id").limit(1);

  return NextResponse.json(
    { ok: !error, checkedAt: new Date().toISOString() },
    { status: error ? 500 : 200 }
  );
}
