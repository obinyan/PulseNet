"use client";
import { useState } from "react";
import { Card } from "@/components/Cards";
import { Empty, FormField } from "@/components/ui";
import { useStore } from "@/lib/store";
import { day, when } from "@/lib/format";
import { downloadCsv, downloadJson } from "@/lib/export";

type Row = Record<string, string | number | boolean | null>;
const DATA = ["Customers", "Payments", "Vouchers", "Sessions", "Routers", "Plans", "Agents", "Batches"] as const;

export function DataExport() {
  const store = useStore();
  const { settings, updateSettings } = store;
  const [what, setWhat] = useState<(typeof DATA)[number]>("Customers");
  const [format, setFormat] = useState<"CSV" | "JSON">("CSV");
  const [from, setFrom] = useState(""); const [to, setTo] = useState(""); const [msg, setMsg] = useState("");

  const source = (w: string): { rows: Row[]; dateKey?: string } => {
    switch (w) {
      case "Customers": return { rows: store.customers.map((c) => ({ name: c.name, phone: c.phone, device: c.device, status: c.status, total_spent: c.spent, first_seen: c.firstSeen })), dateKey: "first_seen" };
      case "Payments": return { rows: store.payments.map((p) => ({ reference: p.reference, customer: p.customer, plan: p.plan, amount: p.amount, method: p.method, status: p.status, date: p.createdAt })), dateKey: "date" };
      case "Vouchers": return { rows: store.vouchers.map((v) => ({ code: v.code, plan_id: v.planId, batch_id: v.batchId, status: v.status, created: v.createdAt, expires: v.expiresAt ?? null })), dateKey: "created" };
      case "Sessions": return { rows: store.sessions.map((s) => ({ voucher: s.voucher, device: s.device, ip: s.ip, router: s.router, plan: s.plan, duration: s.duration, down: s.down, up: s.up })) };
      case "Routers": return { rows: store.routers.map((r) => ({ name: r.name, site: r.site, brand: r.brand, status: r.status, users: r.users, created: r.createdAt })), dateKey: "created" };
      case "Plans": return { rows: store.plans.map((p) => ({ name: p.name, price: p.price, duration: p.duration, unit: p.unit, speed_mbps: p.speed, data_cap_gb: p.dataGb, devices: p.devices, active: p.active, created: p.createdAt })), dateKey: "created" };
      case "Agents": return { rows: store.agents.map((a) => ({ name: a.name, phone: a.phone, email: a.email, area: a.area, commission_percent: a.rate, active: a.active, created: a.createdAt })), dateKey: "created" };
      default: return { rows: store.batches.map((b) => ({ name: b.name, plan_id: b.planId, quantity: b.qty, created: b.createdAt })), dateKey: "created" };
    }
  };
  const run = (w: string, f: "CSV" | "JSON", fr: string, t: string, log: boolean) => {
    const { rows: all, dateKey } = source(w);
    const lo = fr ? new Date(fr).getTime() : 0, hi = t ? new Date(t).getTime() + 86400000 : Infinity;
    const rows = dateKey ? all.filter((r) => { const x = Number(r[dateKey]); return x >= lo && x < hi; }) : all;
    if (rows.length === 0) return setMsg(`There is no ${w.toLowerCase()} data to export for that selection.`);
    const name = `pulsenet-${w.toLowerCase()}.${f.toLowerCase()}`;
    if (f === "JSON") downloadJson(name, rows);
    else { const keys = Object.keys(rows[0]); downloadCsv(name, [keys, ...rows.map((r) => keys.map((k) => String(r[k] ?? "")))]); }
    setMsg(`Exported ${rows.length} ${rows.length === 1 ? "row" : "rows"}.`);
    if (log) updateSettings("exports", [{ id: Math.random().toString(36).slice(2, 10), at: Date.now(), data: w, format: f, from: fr, to: t, rows: rows.length }, ...settings.exports].slice(0, 20));
  };
  const full = () => {
    downloadJson("pulsenet-full-copy.json", { exportedAt: new Date().toISOString(), routers: store.routers.map(({ secret: _s, ...r }) => r), plans: store.plans, vouchers: store.vouchers, batches: store.batches, agents: store.agents, team: store.team, profile: store.profile, settings: { ...settings, branding: { ...settings.branding, logo: null, favicon: null } } });
    setMsg("Full copy downloaded. Router secrets and images are left out.");
  };
  const cols = "1.2fr 1fr .7fr .6fr .6fr";
  return (
    <div className="grid g21 stack" style={{ alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card title="Export your data">
          <form className="fcol" onSubmit={(e) => { e.preventDefault(); run(what, format, from, to, true); }}>
            <div className="two">
              <FormField label="Data"><select className="fi" value={what} onChange={(e) => setWhat(e.target.value as (typeof DATA)[number])}>{DATA.map((d) => <option key={d}>{d}</option>)}</select></FormField>
              <FormField label="Format"><select className="fi" value={format} onChange={(e) => setFormat(e.target.value as "CSV" | "JSON")}><option>CSV</option><option>JSON</option></select></FormField>
              <FormField label="From (optional)"><input className="fi" type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></FormField>
              <FormField label="To (optional)"><input className="fi" type="date" value={to} onChange={(e) => setTo(e.target.value)} /></FormField>
            </div>
            <button className="btn inline" type="submit">Export data</button>
            {msg && <p role="status" style={{ margin: 0, fontSize: 13 }}>{msg}</p>}
          </form>
        </Card>
        <Card title="Export history">
          <div className="scroll"><div style={{ minWidth: 480 }}>
            <div className="tb h" style={{ gridTemplateColumns: cols }}><div>Date</div><div>Data</div><div>Format</div><div>Rows</div><div /></div>
            {settings.exports.map((x) => (
              <div className="tb" key={x.id} style={{ gridTemplateColumns: cols }}>
                <div>{when(x.at)}</div><div>{x.data}</div><div>{x.format}</div><div>{x.rows}</div>
                <div><button className="linkbtn" onClick={() => run(x.data, x.format, x.from, x.to, false)}>Download</button></div>
              </div>
            ))}
          </div></div>
          {settings.exports.length === 0 && <Empty>No exports yet.</Empty>}
        </Card>
      </div>
      <Card title="Full copy">
        <div className="pline"><span className="muted">Includes</span><span style={{ textAlign: "right" }}>Routers, plans, vouchers, agents, team, settings</span></div>
        <div className="pline"><span className="muted">Format</span><span>JSON</span></div>
        <button className="btn" style={{ marginTop: 14 }} onClick={full}>Download full copy</button>
        <p className="muted" style={{ fontSize: 12, margin: "8px 0 0" }}>Today ({day(Date.now())}). Router secrets and uploaded images are not included.</p>
      </Card>
    </div>
  );
}
