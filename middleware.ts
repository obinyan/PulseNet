import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    const path = request.nextUrl.pathname;
    if (path === "/dashboard" || path.startsWith("/dashboard/")) {
      const destination = request.nextUrl.clone();
      destination.pathname = "/login";
      destination.search = "";
      return NextResponse.redirect(destination);
    }
    if (path.startsWith("/admin/")) {
      const destination = request.nextUrl.clone();
      destination.pathname = "/admin";
      destination.search = "";
      return NextResponse.redirect(destination);
    }
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, {
          ...options, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
        }));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const needsOperator = path === "/dashboard" || path.startsWith("/dashboard/");
  const needsAdmin = path.startsWith("/admin/");
  const redirectWithCookies = (destination: URL) => {
    const redirected = NextResponse.redirect(destination);
    response.cookies.getAll().forEach((cookie) => redirected.cookies.set(cookie));
    return redirected;
  };

  if (!needsOperator && !needsAdmin) return response;
  if (!user) {
    const destination = request.nextUrl.clone();
    destination.pathname = needsAdmin ? "/admin" : "/login";
    if (needsAdmin) destination.searchParams.set("next", path);
    return redirectWithCookies(destination);
  }

  const { data: profile } = await supabase.from("profiles").select("role,status").eq("id", user.id).maybeSingle();
  if (!profile || profile.status !== "active") {
    const destination = request.nextUrl.clone();
    destination.pathname = needsAdmin ? "/admin" : "/login";
    destination.search = "";
    return redirectWithCookies(destination);
  }

  if (["owner", "staff", "agent"].includes(profile.role)) {
    const { data: operatorId } = await supabase.rpc("current_operator_id");
    if (!operatorId) {
      const destination = request.nextUrl.clone();
      destination.pathname = "/login";
      destination.search = "";
      return redirectWithCookies(destination);
    }
  }

  if (needsAdmin && profile.role !== "super_admin") {
    const destination = request.nextUrl.clone();
    destination.pathname = "/dashboard";
    destination.search = "";
    return redirectWithCookies(destination);
  }
  if (needsOperator && profile.role === "super_admin") {
    const destination = request.nextUrl.clone();
    destination.pathname = "/admin";
    destination.search = "";
    return redirectWithCookies(destination);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
