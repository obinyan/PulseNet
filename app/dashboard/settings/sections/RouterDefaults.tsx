"use client";
import { useEffect, useState } from "react";
import { Card, Item } from "@/components/Cards";
import { Empty, FormField, ToggleRow } from "@/components/ui";
import { routerScript, useStore, type Router, type Settings } from "@/lib/store";

type R = Settings["routerDefaults"];
const num = (s: string) => (s === "" ? NaN : Number(s));

export function RouterDefaults() {
  const { settings, updateSettings, ready } = useStore();
  const [d, setD] = useState<R>(settings.routerDefaults);
  const [t, setT] = useState({ a: "", i: "", dev: "" });
  const [site, setSite] = useState(""); const [err, setErr] = useState(""); const [saved, setSaved] = useState(false);
  useEffect(() => { if (ready) { setD(settings.routerDefaults); setT({ a: String(settings.routerDefaults.accountingMinutes), i: String(settings.routerDefaults.idleMinutes), dev: String(settings.routerDefaults.devices) }); } }, [ready, settings.routerDefaults]);
  const ch = () => setSaved(false);
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const a = num(t.a), i = num(t.i), dev = num(t.dev);
    if (!(a >= 1 && a <= 60)) return setErr("Accounting interval must be 1 to 60 minutes.");
    if (!(i >= 1 && i <= 1440)) return setErr("Idle timeout must be 1 to 1440 minutes.");
    if (!(Number.isInteger(dev) && dev >= 1 && dev <= 10)) return setErr("Devices per voucher must be a whole number from 1 to 10.");
    const ip = /^(\d{1,3}\.){3}\d{1,3}$/;
    if ((d.dns1 && !ip.test(d.dns1)) || (d.dns2 && !ip.test(d.dns2))) return setErr("DNS servers must be IP addresses like 8.8.8.8.");
    const next = { ...d, accountingMinutes: a, idleMinutes: i, devices: dev };
    setErr(""); setD(next); updateSettings("routerDefaults", next); setSaved(true);
  };
  const addSite = (e: React.FormEvent) => {
    e.preventDefault(); const v = site.trim().toLowerCase();
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(v)) return setErr("Enter a domain like example.com.");
    if (d.freeSites.includes(v)) return setErr("That domain is already in the list.");
    const next = { ...d, freeSites: [...d.freeSites, v] }; setErr(""); setSite(""); setD(next); updateSettings("routerDefaults", next);
  };
  const preview = routerScript({ name: "[router name]", secret: "[router secret]" } as Router, { ...d, accountingMinutes: num(t.a) || d.accountingMinutes, idleMinutes: num(t.i) || d.idleMinutes, devices: num(t.dev) || d.devices });
  return (
    <div className="grid g21 stack" style={{ alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card title="New router defaults">
          <form className="fcol" onSubmit={save}>
            <div className="two">
              <FormField label="Accounting update interval (minutes)"><input className="fi" type="number" min="1" max="60" value={t.a} onChange={(e) => { setT({ ...t, a: e.target.value }); ch(); }} /></FormField>
              <FormField label="Idle timeout (minutes)"><input className="fi" type="number" min="1" value={t.i} onChange={(e) => { setT({ ...t, i: e.target.value }); ch(); }} /></FormField>
              <FormField label="Devices per voucher"><input className="fi" type="number" min="1" max="10" value={t.dev} onChange={(e) => { setT({ ...t, dev: e.target.value }); ch(); }} /></FormField>
              <span />
              <FormField label="DNS server 1"><input className="fi" value={d.dns1} onChange={(e) => { setD({ ...d, dns1: e.target.value.trim() }); ch(); }} /></FormField>
              <FormField label="DNS server 2"><input className="fi" value={d.dns2} onChange={(e) => { setD({ ...d, dns2: e.target.value.trim() }); ch(); }} /></FormField>
            </div>
            <ToggleRow title="Remember devices" hint="Skip the login after a device's first use" on={d.rememberDevices} onChange={(v) => { setD({ ...d, rememberDevices: v }); ch(); }} />
            {err && <p className="err" role="alert">{err}</p>}
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}><button className="btn inline" type="submit">Save changes</button>{saved && <span role="status" style={{ fontSize: 13 }}>Saved</span>}</div>
          </form>
        </Card>
        <Card title="Free sites before login">
          <p className="muted" style={{ margin: "0 0 8px", fontSize: 13 }}>Sites customers can open without a voucher, such as your payment page.</p>
          {d.freeSites.map((x) => <div className="item" key={x}><div><b>{x}</b></div><button className="linkbtn" onClick={() => { const next = { ...d, freeSites: d.freeSites.filter((y) => y !== x) }; setD(next); updateSettings("routerDefaults", next); }}>Remove</button></div>)}
          {d.freeSites.length === 0 && <Empty>No free sites yet.</Empty>}
          <form onSubmit={addSite} style={{ display: "flex", gap: 10, marginTop: 12 }}><input className="fi" placeholder="Add a domain" aria-label="Add a domain" value={site} onChange={(e) => setSite(e.target.value)} /><button className="btn inline" type="submit">Add</button></form>
        </Card>
      </div>
      <Card title="Script preview">
        <pre className="code">{preview}</pre>
        <p className="muted" style={{ fontSize: 12, margin: "10px 0 0" }}>Applies to routers you add from now on. Commands can differ between RouterOS versions, so review before applying.</p>
      </Card>
    </div>
  );
}
