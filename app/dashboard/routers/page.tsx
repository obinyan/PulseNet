"use client";
import { useMemo, useRef, useState } from "react";
import { Card, Stat } from "@/components/Cards";
import { Chips, Empty, FormField, PageHead } from "@/components/ui";
import { RADIUS_HOST, routerScript, useStore } from "@/lib/store";
import { when } from "@/lib/format";

const FILTERS = ["All", "Online", "Offline"] as const;

export default function RoutersPage() {
  const { routers, addRouter, removeRouter, settings } = useStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [q, setQ] = useState("");
  const [name, setName] = useState("");
  const [site, setSite] = useState("");
  const [error, setError] = useState("");
  const [shown, setShown] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const online = routers.filter((r) => r.status === "online").length;
  const users = routers.reduce((n, r) => n + r.users, 0);
  const list = useMemo(() => routers.filter((r) => (filter === "All" || (filter === "Online") === (r.status === "online")) && `${r.name} ${r.site}`.toLowerCase().includes(q.toLowerCase())), [routers, filter, q]);
  const current = routers.find((r) => r.id === shown);
  const cols = "1.6fr 1fr 1fr .9fr .6fr 1.1fr 1.4fr";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Enter a router name.");
    setError("");
    const r = addRouter({ name: name.trim(), site: site.trim(), brand: "MikroTik" });
    setShown(r.id); setCopied(false); setName(""); setSite("");
  };
  const copy = async () => {
    if (!current) return;
    try { await navigator.clipboard.writeText(routerScript(current, settings.routerDefaults)); setCopied(true); } catch { setCopied(false); }
  };

  return (
    <>
      <PageHead title="Routers" sub={`${routers.length} ${routers.length === 1 ? "router" : "routers"}`} action={<button className="btn inline" onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}>+ Add router</button>} />
      <div className="autofit">
        <Stat label="Online" value={String(online)} note={`of ${routers.length} routers`} />
        <Stat label="Offline" value={String(routers.length - online)} note="not connected" />
        <Stat label="Users connected" value={String(users)} note="across all routers" />
      </div>
      <div className="toolbar">
        <Chips items={FILTERS} value={filter} onChange={setFilter} />
        <input className="fi" placeholder="Search routers" aria-label="Search routers" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="grid g21 stack" style={{ alignItems: "start" }}>
        <Card title="All routers">
          <div className="scroll"><div style={{ minWidth: 680 }}>
            <div className="tb h" style={{ gridTemplateColumns: cols }}><div>Router</div><div>Site</div><div>Brand</div><div>Status</div><div>Users</div><div>Last seen</div><div /></div>
            {list.map((r) => (
              <div className="tb" key={r.id} style={{ gridTemplateColumns: cols }}>
                <div><b>{r.name}</b></div><div>{r.site || "None"}</div><div>{r.brand}</div>
                <div><span className="pill">{r.status === "online" ? "Online" : "Offline"}</span></div>
                <div>{r.users}</div><div>{when(r.lastSeen)}</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="linkbtn" onClick={() => { setShown(r.id); setCopied(false); }}>Script</button>
                  <a className="linkbtn" href={`/portal/${r.id}`} target="_blank" rel="noreferrer">Login page</a>
                  <button className="linkbtn" onClick={() => { if (confirm(`Remove ${r.name}?`)) removeRouter(r.id); }}>Remove</button>
                </div>
              </div>
            ))}
          </div></div>
          {list.length === 0 && <Empty>{routers.length === 0 ? "No routers yet. Add your first router using the form." : "No routers match your filter."}</Empty>}
        </Card>
        <div ref={formRef}>
          <Card title="Add a router">
            <form className="fcol" onSubmit={submit}>
              <FormField label="Router name"><input className="fi" value={name} onChange={(e) => setName(e.target.value)} /></FormField>
              <FormField label="Site or location"><input className="fi" value={site} onChange={(e) => setSite(e.target.value)} /></FormField>
              <FormField label="Brand"><select className="fi" defaultValue="MikroTik"><option>MikroTik</option><option disabled>More brands coming later</option></select></FormField>
              {error && <p className="err" role="alert">{error}</p>}
              <button className="btn" type="submit">Add router</button>
            </form>
            {current && (
              <div className="fcol" style={{ marginTop: 16 }}>
                <b style={{ fontSize: 14 }}>Setup script for {current.name}</b>
                <pre className="code">{routerScript(current, settings.routerDefaults)}</pre>
                {RADIUS_HOST === "YOUR_SERVER_IP" && <p className="muted" style={{ fontSize: 12, margin: 0 }}>Set NEXT_PUBLIC_RADIUS_HOST in .env.local to your RADIUS server address.</p>}
                <p className="muted" style={{ fontSize: 12, margin: 0 }}>Review before applying. Commands can differ between RouterOS versions.</p>
                <button className="btn ghost" onClick={copy}>{copied ? "Copied" : "Copy script"}</button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
