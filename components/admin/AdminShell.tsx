"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon, PulseIcon } from "../icons";
import { SignOutButton } from "../SignOutButton";

const NAV = [
  { label: "Overview", href: "/admin", icon: "overview" },
  { label: "Operators", href: "/admin/operators", icon: "customers" },
  { label: "Subscription plans", href: "/admin/plans", icon: "plans" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const on = () => setScrolled(window.scrollY > 4); on(); window.addEventListener("scroll", on, { passive: true }); return () => window.removeEventListener("scroll", on); }, []);
  const on = (h: string) => (h === "/admin" ? path === h : path.startsWith(h));
  return (
    <div className="stage">
      <div className="orb" style={{ width: 520, height: 520, left: -120, bottom: -140, background: "#3b50c8" }} />
      <div className="orb" style={{ width: 420, height: 420, right: -60, top: -100, background: "#6a82ff", opacity: 0.8 }} />
      <div className="shell">
        <aside className="glass side">
          <Link href="/admin" className="brand"><PulseIcon size={34} /><span className="wm">PulseNet</span></Link>
          <span className="pill" style={{ alignSelf: "flex-start", margin: "-12px 0 12px 4px" }}>Admin</span>
          {NAV.map((n) => <Link key={n.href} href={n.href} className={`nav ${on(n.href) ? "active" : ""}`}><Icon name={n.icon} />{n.label}</Link>)}
          <div style={{ flex: 1, minHeight: 56 }} />
          <Link href="/dashboard" className="nav"><Icon name="routers" />Operator dashboard</Link>
          <SignOutButton />
        </aside>
        <div className="content">
          <header className={`mhead ${scrolled ? "scrolled" : ""}`}>
            <Link href="/admin" className="brand" style={{ margin: 0 }}><PulseIcon size={34} /><span className="wm">PulseNet</span><span className="pill">Admin</span></Link>
          </header>
          <main className="main">{children}</main>
        </div>
      </div>
      <nav className="glass mnav" aria-label="Admin">
        {NAV.map((n) => <Link key={n.href} href={n.href} className={`tab ${on(n.href) ? "active" : ""}`}><Icon name={n.icon} />{n.label === "Subscription plans" ? "Plans" : n.label}</Link>)}
        <SignOutButton variant="mobile" />
      </nav>
    </div>
  );
}
