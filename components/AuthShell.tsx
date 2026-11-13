import Link from "next/link";
import { PulseIcon } from "./icons";

export function Field({ label, type = "text", placeholder = "", name, password = false }: { label: string; type?: string; placeholder?: string; name: string; password?: boolean }) {
  return (
    <label className="field">
      <span>{label}</span>
      {password ? <PasswordInput name={name} placeholder={placeholder} /> : <input name={name} type={type} placeholder={placeholder} required />}
    </label>
  );
}
import { PasswordInput } from "./PasswordInput";

export function AuthShell({ variant, children }: { variant: "login" | "signup"; children: React.ReactNode }) {
  const login = variant === "login";
  return (
    <main className={`stage ${login ? "alt" : ""}`}>
      <div className="orb" style={{ width: 520, height: 520, [login ? "right" : "left"]: -130, bottom: -130, background: login ? "#000f6b" : "#3b50c8" }} />
      <div className="orb" style={{ width: 420, height: 420, [login ? "left" : "right"]: -100, top: -110, background: login ? "#8ea0ff" : "#6a82ff", opacity: 0.8 }} />
      <div className="auth">
        <div className="auth-left">
          <Link href="/" className="wm" style={{ textDecoration: "none" }}>PulseNet</Link>
          <div className="auth-icon"><PulseIcon /></div>
          <div className="auth-copy">
            <h1>Run your hotspot business<br />from one place.</h1>
            <p>Routers, plans, vouchers and sessions, managed from a single dashboard.</p>
          </div>
        </div>
        <div className="auth-card-wrap">
          <div className={`glass auth-card ${login ? "navy" : "signup"}`}>{children}</div>
        </div>
      </div>
    </main>
  );
}
