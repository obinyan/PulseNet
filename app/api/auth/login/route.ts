import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });

    const supabase = await createSupabaseServerClient();
    const { data: auth, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError || !auth.user) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });

    const { data: profile, error: profileError } = await supabase
      .from("profiles").select("role,status").eq("id", auth.user.id).maybeSingle();
    if (profileError || !profile || profile.status !== "active") {
      await supabase.auth.signOut();
      return NextResponse.json({ error: "This account is not active. Contact PulseNet support." }, { status: 403 });
    }

    if (["owner", "staff", "agent"].includes(profile.role)) {
      const { data: operatorId } = await supabase.rpc("current_operator_id");
      if (!operatorId) {
        await supabase.auth.signOut();
        return NextResponse.json({ error: "This operator account is suspended or unavailable." }, { status: 403 });
      }
    }

    if (body.admin && profile.role !== "super_admin") {
      await supabase.auth.signOut();
      return NextResponse.json({ error: "This account does not have administrator access." }, { status: 403 });
    }

    return NextResponse.json({ redirectTo: profile.role === "super_admin" ? "/admin" : "/dashboard" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sign in.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
