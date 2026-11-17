import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("role,status").eq("id", user.id).maybeSingle();
    if (profile?.role !== "super_admin" || profile.status !== "active") {
      return NextResponse.json({ error: "Super-admin access required." }, { status: 403 });
    }

    const [{ data: operators, error: operatorsError }, { data: owners, error: ownersError }] = await Promise.all([
      supabase.from("operators").select("id,business_name,email,phone,status,created_at").order("created_at", { ascending: false }),
      supabase.from("profiles").select("operator_id,full_name").eq("role", "owner").eq("status", "active"),
    ]);
    if (operatorsError) throw operatorsError;
    if (ownersError) throw ownersError;

    const ownerNames = new Map((owners || []).map((owner) => [owner.operator_id, owner.full_name]));
    const result = (operators || []).map((operator) => ({
      id: operator.id,
      business: operator.business_name,
      name: ownerNames.get(operator.id) || "",
      email: operator.email,
      phone: operator.phone,
      status: operator.status,
      createdAt: new Date(operator.created_at).getTime(),
    }));
    return NextResponse.json({ operators: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load operators.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
