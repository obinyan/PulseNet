import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();
    if (error) return NextResponse.json({ error: "Unable to sign out. Please try again." }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to sign out. Please try again." }, { status: 500 });
  }
}
