"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field } from "./AuthShell";

export function LoginForm({ admin = false }: { admin?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(e.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password"), admin }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to sign in.");
      router.replace(result.redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="welcome">{admin ? "PulseNet platform access" : "Welcome back to your workspace"}</div>
      <h2 className="login-title">{admin ? "Admin sign in" : "Login"}</h2>
      <Field label="Email" name="email" type="email" required autoComplete="email" />
      <Field label="Password" name="password" password required autoComplete="current-password" />
      {error && <p className="err" role="alert">{error}</p>}
      <button className="btn" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      {!admin && <div className="foot">New to PulseNet? <Link href="/signup" style={{ textDecoration: "underline" }}>Create an account</Link></div>}
    </form>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    const form = new FormData(e.currentTarget);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business: form.get("business"), name: form.get("name"), email: form.get("email"),
          phone: form.get("phone"), password: form.get("password"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to create account.");
      if (result.confirmationRequired) {
        setMessage("Your account was created. Check your email to confirm it, then sign in.");
      } else {
        router.replace("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <h2 className="auth-title">Create your Account</h2>
      <Field label="Business name" name="business" placeholder="Your business Ltd" required autoComplete="organization" />
      <Field label="Full name" name="name" placeholder="Your name" required autoComplete="name" />
      <Field label="Work email" name="email" type="email" placeholder="you@company.com" required autoComplete="email" />
      <Field label="Phone" name="phone" type="tel" placeholder="Phone number" autoComplete="tel" />
      <Field label="Password" name="password" placeholder="Create a password" password required minLength={8} autoComplete="new-password" />
      <div className="hint" style={{ margin: "-16px 0 24px" }}>Must be at least 8 characters</div>
      {error && <p className="err" role="alert">{error}</p>}
      {message && <p role="status" style={{ margin: "0 0 16px", fontSize: 13 }}>{message}</p>}
      <button className="btn" type="submit" disabled={busy}>{busy ? "Creating account…" : "Create account"}</button>
      <div className="foot">Already have an account? <Link href="/login">Login</Link></div>
    </form>
  );
}
