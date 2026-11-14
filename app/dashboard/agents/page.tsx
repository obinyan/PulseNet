"use client";
import { useMemo, useRef, useState } from "react";
import { Card, Stat } from "@/components/Cards";
import { Chips, Empty, FormField, PageHead } from "@/components/ui";
import { useStore } from "@/lib/store";
import { money } from "@/lib/format";

const FILTERS = ["All", "Active", "Inactive"] as const;
const BLANK = { name: "", phone: "", email: "", area: "", rate: "", batchId: "" };

export default function AgentsPage() {
  const { agents, batches, vouchers, plans, addAgent, removeAgent, toggleAgent } = useStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [q, setQ] = useState("");
  const [f, setF] = useState(BLANK);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLDivElement>(null);
  const set = (k: keyof typeof BLANK) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  const rows = useMemo(() => agents.map((a) => {
    const b = batches.find((x) => x.id === a.batchId);
    const price = plans.find((p) => p.id === b?.planId)?.price ?? 0;
    const sold = b ? vouchers.filter((v) => v.batchId === b.id && v.status === "used").length : 0;
    const sales = sold * price;
    return { a, allocated: b?.qty ?? 0, sold, sales, owed: Math.round((sales * a.rate) / 100) };
  }), [agents, batches, vouchers, plans]);
  const list = rows.filter((r) => (filter === "All" || (filter === "Active") === r.a.active) && `${r.a.name} ${r.a.area} ${r.a.phone}`.toLowerCase().includes(q.toLowerCase()));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const rate = Number(f.rate);
    if (!f.name.trim()) return setError("Enter the agent's name.");
    if (!f.phone.trim()) return setError("Enter a phone number.");
    if (f.rate === "" || !(rate >= 0 && rate <= 100)) return setError("Commission must be between 0 and 100.");
    setError("");
    addAgent({ name: f.name.trim(), phone: f.phone.trim(), email: f.email.trim(), area: f.area.trim(), rate, batchId: f.batchId || null });
    setF(BLANK);
  };
  const cols = "1.5fr 1fr .9fr .8fr 1fr .8fr .9fr 1.1fr";
  return (
    <>
      <PageHead title="Agents" sub={`${agents.length} ${agents.length === 1 ? "agent" : "agents"}`} action={<button className="btn inline" onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}>+ Add agent</button>} />
      <div className="autofit">
        <Stat label="Agents" value={String(agents.length)} note="registered" />
        <Stat label="Active agents" value={String(agents.filter((a) => a.active).length)} note="can sell" />
        <Stat label="Vouchers sold by agents" value={String(rows.reduce((n, r) => n + r.sold, 0))} note="all time" />
        <Stat label="Commission owed" value={money(rows.reduce((n, r) => n + r.owed, 0))} note="unpaid" />
      </div>
      <div className="toolbar">
        <Chips items={FILTERS} value={filter} onChange={setFilter} />
        <input className="fi" placeholder="Search agents" aria-label="Search agents" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="grid g21 stack" style={{ alignItems: "start" }}>
        <Card title="All agents">
          <div className="scroll"><div style={{ minWidth: 760 }}>
            <div className="tb h" style={{ gridTemplateColumns: cols }}><div>Agent</div><div>Area</div><div>Allocated</div><div>Sold</div><div>Sales</div><div>Rate</div><div>Owed</div><div /></div>
            {list.map(({ a, allocated, sold, sales, owed }) => (
              <div className="tb" key={a.id} style={{ gridTemplateColumns: cols }}>
                <div><b>{a.name}</b><div className="muted" style={{ fontSize: 12 }}>{a.phone}{a.active ? "" : " · Inactive"}</div></div>
                <div>{a.area || "None"}</div><div>{allocated}</div><div>{sold}</div><div>{money(sales)}</div><div>{a.rate}%</div><div>{money(owed)}</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="linkbtn" onClick={() => toggleAgent(a.id)}>{a.active ? "Pause" : "Activate"}</button>
                  <button className="linkbtn" onClick={() => { if (confirm(`Remove ${a.name}?`)) removeAgent(a.id); }}>Remove</button>
                </div>
              </div>
            ))}
          </div></div>
          {list.length === 0 && <Empty>{agents.length === 0 ? "No agents yet. Add your first agent using the form." : "No agents match your filter."}</Empty>}
        </Card>
        <div ref={formRef}>
          <Card title="Add an agent">
            <form className="fcol" onSubmit={submit}>
              <FormField label="Full name"><input className="fi" value={f.name} onChange={set("name")} /></FormField>
              <FormField label="Phone"><input className="fi" type="tel" value={f.phone} onChange={set("phone")} /></FormField>
              <FormField label="Email (optional)"><input className="fi" type="email" value={f.email} onChange={set("email")} /></FormField>
              <FormField label="Area or location"><input className="fi" value={f.area} onChange={set("area")} /></FormField>
              <FormField label="Commission rate (%)"><input className="fi" type="number" min="0" max="100" value={f.rate} onChange={set("rate")} /></FormField>
              <FormField label="Allocate a voucher batch (optional)">
                <select className="fi" value={f.batchId} onChange={set("batchId")}><option value="">None</option>{batches.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.qty})</option>)}</select>
              </FormField>
              {error && <p className="err" role="alert">{error}</p>}
              <button className="btn" type="submit">Add agent</button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
