import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const business = typeof body.business === "string" ? body.business.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!business || !name || !email || password.length < 8) {
      return NextResponse.json({ error: "Enter your business name, full name, valid email, and a password of at least 8 characters." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const siteOrigin = process.env.APP_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : new URL(request.url).origin);
    const callbackUrl = new URL("/auth/callback", siteOrigin);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: callbackUrl.toString(),
        data: { business_name: business, full_name: name, phone },
      },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // When confirmation is disabled, leave the newly created operator signed out
    // so they continue through the normal login form.
    if (data.session) await supabase.auth.signOut();
    return NextResponse.json({ confirmationRequired: !data.session });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create account.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
