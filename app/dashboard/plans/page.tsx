"use client";
import { useMemo, useState } from "react";
import { Card } from "@/components/Cards";
import { Chips, Empty, FormField, PageHead } from "@/components/ui";
import { useStore, type Plan } from "@/lib/store";
import { dur, money } from "@/lib/format";

const FILTERS = ["All", "Active", "Inactive"] as const;
const BLANK = { name: "", price: "", duration: "1", unit: "days", speed: "", dataGb: "", devices: "1" };

export default function PlansPage() {
  const { plans, vouchers, addPlan, updatePlan, removePlan, duplicatePlan, togglePlan } = useStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [f, setF] = useState(BLANK);
  const [error, setError] = useState("");
  const set = (k: keyof typeof BLANK) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  const counts = useMemo(() => { const m: Record<string, number> = {}; vouchers.forEach((v) => { m[v.planId] = (m[v.planId] || 0) + 1; }); return m; }, [vouchers]);
  const list = plans.filter((p) => filter === "All" || (filter === "Active") === p.active);

  const openNew = () => { setEditing(null); setF(BLANK); setError(""); setOpen(true); };
  const openEdit = (p: Plan) => { setEditing(p.id); setF({ name: p.name, price: String(p.price), duration: String(p.duration), unit: p.unit, speed: String(p.speed), dataGb: p.dataGb === null ? "" : String(p.dataGb), devices: String(p.devices) }); setError(""); setOpen(true); };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(f.price), duration = Number(f.duration), speed = Number(f.speed), devices = Number(f.devices);
    if (!f.name.trim()) return setError("Enter a plan name.");
    if (f.price === "" || !(price >= 0)) return setError("Enter a price of 0 or more.");
    if (!(duration > 0)) return setError("Duration must be more than 0.");
    if (!(speed > 0)) return setError("Enter a speed in Mbps.");
    if (!(devices >= 1)) return setError("At least 1 device.");
    const dataGb = f.dataGb === "" ? null : Number(f.dataGb);
    if (dataGb !== null && !(dataGb > 0)) return setError("Data cap must be more than 0, or empty for none.");
    const input = { name: f.name.trim(), price, duration, unit: f.unit as "hours" | "days", speed, dataGb, devices };
    if (editing) updatePlan(editing, input); else addPlan(input);
    setOpen(false);
  };

  return (
    <>
      <PageHead title="Plans" sub={`${plans.length} ${plans.length === 1 ? "plan" : "plans"}`} action={<button className="btn inline" onClick={openNew}>+ Create plan</button>} />
      {open && (
        <Card title={editing ? "Edit plan" : "Create a plan"}>
          <form className="fcol" onSubmit={submit}>
            <div className="fgrid">
              <FormField label="Plan name"><input className="fi" value={f.name} onChange={set("name")} /></FormField>
              <FormField label="Price (₦)"><input className="fi" type="number" min="0" value={f.price} onChange={set("price")} /></FormField>
              <FormField label="Duration"><input className="fi" type="number" min="1" value={f.duration} onChange={set("duration")} /></FormField>
              <FormField label="Duration unit"><select className="fi" value={f.unit} onChange={set("unit")}><option value="hours">Hours</option><option value="days">Days</option></select></FormField>
              <FormField label="Speed (Mbps)"><input className="fi" type="number" min="1" value={f.speed} onChange={set("speed")} /></FormField>
              <FormField label="Data cap (GB, optional)"><input className="fi" type="number" min="0" value={f.dataGb} onChange={set("dataGb")} /></FormField>
              <FormField label="Devices allowed"><input className="fi" type="number" min="1" value={f.devices} onChange={set("devices")} /></FormField>
            </div>
            {error && <p className="err" role="alert">{error}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn inline" type="submit">Save plan</button>
              <button className="btn inline ghost" type="button" onClick={() => setOpen(false)}>Cancel</button>
            </div>
          </form>
        </Card>
      )}
      <Chips items={FILTERS} value={filter} onChange={setFilter} />
      <div className="plans">
        {list.map((p) => (
          <div className="glass" key={p.id}>
            <div className="row"><span className="ct">{p.name}</span><button className="sw" role="switch" aria-checked={p.active} aria-label={`${p.name} active`} onClick={() => togglePlan(p.id)}><i /></button></div>
            <div style={{ font: "700 30px Inter,sans-serif", margin: "12px 0" }}>{money(p.price)}</div>
            <div className="pline"><span className="muted">Duration</span><span>{dur(p.duration, p.unit)}</span></div>
            <div className="pline"><span className="muted">Speed</span><span>{p.speed} Mbps</span></div>
            <div className="pline"><span className="muted">Data cap</span><span>{p.dataGb === null ? "None" : `${p.dataGb} GB`}</span></div>
            <div className="pline"><span className="muted">Devices</span><span>{p.devices}</span></div>
            <div className="pline"><span className="muted">Vouchers generated</span><span>{counts[p.id] || 0}</span></div>
            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
              <button className="btn inline ghost" onClick={() => openEdit(p)}>Edit</button>
              <button className="btn inline ghost" onClick={() => duplicatePlan(p.id)}>Duplicate</button>
              <button className="linkbtn" onClick={() => { if (confirm(`Delete ${p.name}?`)) removePlan(p.id); }}>Delete</button>
            </div>
          </div>
        ))}
        <button className="glass" onClick={openNew} style={{ borderStyle: "dashed", minHeight: 200, color: "#fff", cursor: "pointer", font: "600 16px Inter,sans-serif" }}>+ Create a plan</button>
      </div>
      {plans.length === 0 && <Empty>No plans yet. Create your first plan to start selling access.</Empty>}
    </>
  );
}
