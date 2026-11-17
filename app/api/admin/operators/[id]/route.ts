import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    if (body.status !== "active" && body.status !== "suspended") {
      return NextResponse.json({ error: "Choose a valid operator status." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    const { data: profile } = await supabase.from("profiles").select("role,status").eq("id", user.id).maybeSingle();
    if (profile?.role !== "super_admin" || profile.status !== "active") {
      return NextResponse.json({ error: "Super-admin access required." }, { status: 403 });
    }

    const { data, error } = await supabase.from("operators").update({ status: body.status }).eq("id", params.id)
      .select("id").maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Operator not found or update not allowed." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update operator status.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
