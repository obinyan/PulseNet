"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Field } from "./AuthShell";

// Placeholder submit: real authentication is added in the next step.
function useGoToDashboard() {
  const router = useRouter();
  return (e: React.FormEvent) => { e.preventDefault(); router.push("/dashboard"); };
}

export function LoginForm() {
  const submit = useGoToDashboard();
  return (
    <form onSubmit={submit}>
      <div className="welcome">Welcome back to your workspace</div>
      <h2 className="login-title">Login</h2>
      <Field label="Email" name="email" type="email" />
      <Field label="Password" name="password" password />
      <div className="small" style={{ margin: "-8px 0 16px 6px" }}>Forgot?</div>
      <label className="small" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 60 }}>
        <input type="checkbox" name="remember" style={{ margin: 0, accentColor: "#fff" }} /> Remember me
      </label>
      <button className="btn" type="submit">Sign in</button>
      <div className="foot">New to PulseNet? <Link href="/signup" style={{ textDecoration: "underline" }}>Create an account</Link></div>
    </form>
  );
}

export function SignupForm() {
  const submit = useGoToDashboard();
  return (
    <form onSubmit={submit}>
      <h2 className="auth-title">Create your Account</h2>
      <Field label="Business name" name="business" placeholder="Your business Ltd" />
      <Field label="Full name" name="name" placeholder="Your name" />
      <Field label="Work email" name="email" type="email" placeholder="you@company.com" />
      <Field label="Phone" name="phone" type="tel" placeholder="Phone number" />
      <Field label="Password" name="password" placeholder="Create a password" password />
      <div className="hint" style={{ margin: "-16px 0 24px" }}>Must be at least 8 characters</div>
      <button className="btn" type="submit">Create account</button>
      <div className="foot">Already have an account? <Link href="/login">Login</Link></div>
    </form>
  );
}
