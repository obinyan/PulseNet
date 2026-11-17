import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const url = () => process.env.SUPABASE_URL;
const key = () => process.env.SUPABASE_PUBLISHABLE_KEY;

export async function createSupabaseServerClient() {
  const projectUrl = url();
  const publishableKey = key();
  if (!projectUrl || !publishableKey) throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.");

  const cookieStore = cookies();
  return createServerClient(projectUrl, publishableKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, {
            ...options, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
          }));
        } catch {
          // Server components cannot write cookies; middleware and route handlers can.
        }
      },
    },
  });
}

export function isSupabaseConfigured() {
  return Boolean(url() && key());
}
