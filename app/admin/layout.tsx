import { redirect } from "next/navigation";
import { AdminProvider } from "@/lib/admin-store";
import { AdminShell } from "@/components/admin/AdminShell";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase-server";

export const metadata = { title: "PulseNet Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) return <>{children}</>;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <>{children}</>;
  const { data: profile } = await supabase.from("profiles").select("role,status").eq("id", user.id).maybeSingle();
  if (profile?.role !== "super_admin" || profile.status !== "active") redirect("/dashboard");
  return <AdminProvider><AdminShell>{children}</AdminShell></AdminProvider>;
}
