"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/Cards";
import { Empty, FormField, PageHead } from "@/components/ui";
import { useStore, type Member, type Profile } from "@/lib/store";
import { SETTINGS_SECTIONS } from "@/lib/settings-sections";
import { Branding } from "./sections/Branding";
import { Notifications } from "./sections/Notifications";
import { Gateway } from "./sections/Gateway";
import { RouterDefaults } from "./sections/RouterDefaults";
import { VoucherFormat } from "./sections/VoucherFormat";
import { Billing } from "./sections/Billing";
import { Security } from "./sections/Security";
import { DataExport } from "./sections/Export";

const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "Other"];
const CURRENCIES = ["NGN", "GHS", "KES", "ZAR", "USD"];
const ZONES = ["Africa/Lagos", "Africa/Accra", "Africa/Nairobi", "Africa/Johannesburg", "UTC"];
const ACCESS: [string, string, string, string][] = [
  ["Routers", "Full", "Full", "None"], ["Plans", "Full", "Full", "None"], ["Vouchers", "Full", "Full", "Sell only"], ["Sessions", "Full", "Full", "None"],
  ["Customers", "Full", "Full", "None"], ["Payments", "Full", "View", "None"], ["Reports", "Full", "View", "None"], ["Settings", "Full", "None", "None"],
];

function BusinessProfile() {
  const { profile, saveProfile, ready } = useStore();
  const [p, setP] = useState<Profile>(profile);
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (ready) setP(profile); }, [ready, profile]);
  const set = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setP({ ...p, [k]: e.target.value }); setSaved(false); };
  const opts = (xs: string[]) => xs.map((x) => <option key={x}>{x}</option>);
  return (
    <Card title="Business profile">
      <form className="fcol" onSubmit={(e) => { e.preventDefault(); saveProfile(p); setSaved(true); }}>
        <div className="fgrid">
          <FormField label="Business name"><input className="fi" value={p.name} onChange={set("name")} /></FormField>
          <FormField label="Contact email"><input className="fi" type="email" value={p.email} onChange={set("email")} /></FormField>
          <FormField label="Phone"><input className="fi" type="tel" value={p.phone} onChange={set("phone")} /></FormField>
          <FormField label="Country"><select className="fi" value={p.country} onChange={set("country")}>{opts(COUNTRIES)}</select></FormField>
          <FormField label="Currency"><select className="fi" value={p.currency} onChange={set("currency")}>{opts(CURRENCIES)}</select></FormField>
          <FormField label="Time zone"><select className="fi" value={p.timezone} onChange={set("timezone")}>{opts(ZONES)}</select></FormField>
        </div>
        <FormField label="Address"><input className="fi" value={p.address} onChange={set("address")} /></FormField>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="btn inline" type="submit">Save changes</button>
          {saved && <span role="status" style={{ fontSize: 13 }}>Saved</span>}
        </div>
      </form>
    </Card>
  );
}

function Staff() {
  const { team, inviteMember, removeMember } = useStore();
  const [email, setEmail] = useState(""); const [name, setName] = useState(""); const [role, setRole] = useState<Member["role"]>("staff"); const [error, setError] = useState("");
  const cols = "1.5fr 1.5fr .9fr .9fr .7fr";
  const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
  return (
    <>
      <div className="grid g21 stack" style={{ alignItems: "start" }}>
        <Card title="Team members">
          <div className="scroll"><div style={{ minWidth: 560 }}>
            <div className="tb h" style={{ gridTemplateColumns: cols }}><div>Name</div><div>Email</div><div>Role</div><div>Status</div><div /></div>
            {team.map((m) => (
              <div className="tb" key={m.id} style={{ gridTemplateColumns: cols }}>
                <div><b>{m.name || "Unnamed"}</b></div><div>{m.email}</div><div><span className="pill">{cap(m.role)}</span></div><div><span className="pill">{cap(m.status)}</span></div>
                <div><button className="linkbtn" onClick={() => { if (confirm(`Remove ${m.email}?`)) removeMember(m.id); }}>Remove</button></div>
              </div>
            ))}
          </div></div>
          {team.length === 0 && <Empty>No team members yet. Invite your first one.</Empty>}
        </Card>
        <Card title="Invite a member">
          <form className="fcol" onSubmit={(e) => { e.preventDefault(); if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address."); setError(""); inviteMember({ name: name.trim(), email: email.trim(), role }); setEmail(""); setName(""); }}>
            <FormField label="Name (optional)"><input className="fi" value={name} onChange={(e) => setName(e.target.value)} /></FormField>
            <FormField label="Email"><input className="fi" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></FormField>
            <FormField label="Role"><select className="fi" value={role} onChange={(e) => setRole(e.target.value as Member["role"])}><option value="staff">Staff</option><option value="agent">Agent</option><option value="owner">Owner</option></select></FormField>
            {error && <p className="err" role="alert">{error}</p>}
            <button className="btn" type="submit">Add invite</button>
            <p className="muted" style={{ margin: 0, fontSize: 12 }}>Invite emails are sent once the backend is connected.</p>
          </form>
        </Card>
      </div>
      <Card title="Role access (proposed)">
        <div className="scroll"><div style={{ minWidth: 480 }}>
          <div className="tb h" style={{ gridTemplateColumns: "1.4fr 1fr 1fr 1fr" }}><div>Area</div><div>Owner</div><div>Staff</div><div>Agent</div></div>
          {ACCESS.map((r) => <div className="tb" key={r[0]} style={{ gridTemplateColumns: "1.4fr 1fr 1fr 1fr" }}>{r.map((c, i) => <div key={i}>{c}</div>)}</div>)}
        </div></div>
      </Card>
    </>
  );
}

export default function SettingsView() {
  const slug = useSearchParams().get("s") ?? "business";
  const cur = SETTINGS_SECTIONS.find((x) => x.slug === slug) ?? SETTINGS_SECTIONS[0];
  return (
    <>
      <PageHead title="Settings" sub={cur.label} />
      <div className="grid g13 stack" style={{ alignItems: "start" }}>
        <nav className="glass snav" aria-label="Settings sections">
          {SETTINGS_SECTIONS.map((x) => <Link key={x.slug} href={`/dashboard/settings?s=${x.slug}`} className={`nav ${x.slug === cur.slug ? "active" : ""}`} style={{ height: 40 }}>{x.label}</Link>)}
        </nav>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {cur.slug === "business" && <BusinessProfile />}
          {cur.slug === "staff" && <Staff />}
          {cur.slug === "branding" && <Branding />}
          {cur.slug === "notifications" && <Notifications />}
          {cur.slug === "gateway" && <Gateway />}
          {cur.slug === "router-defaults" && <RouterDefaults />}
          {cur.slug === "voucher-format" && <VoucherFormat />}
          {cur.slug === "billing" && <Billing />}
          {cur.slug === "security" && <Security />}
          {cur.slug === "export" && <DataExport />}
        </div>
      </div>
    </>
  );
}
