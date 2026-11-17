import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "@/components/AuthForms";
import AdminOverview from "@/components/admin/AdminOverview";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase-server";

export default async function AdminPage() {
  if (!isSupabaseConfigured()) {
    return <AuthShell variant="login"><LoginForm admin /></AuthShell>;
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <AuthShell variant="login"><LoginForm admin /></AuthShell>;

  const { data: profile } = await supabase.from("profiles").select("role,status").eq("id", user.id).maybeSingle();
  if (profile?.role === "super_admin" && profile.status === "active") return <AdminOverview />;
  return <AuthShell variant="login"><LoginForm admin notice="You are signed in with an operator account. Sign in here with a super-admin account." /></AuthShell>;
}
