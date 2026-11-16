"use client";
import { useState } from "react";
import { Card } from "@/components/Cards";
import { Empty, FormField, PageHead } from "@/components/ui";
import { useAdmin, type SubPlan } from "@/lib/admin-store";
import { money } from "@/lib/format";

const BLANK = { name: "", price: "", routers: "", customers: "", sms: "0" };

export default function SubscriptionPlans() {
  const { plans, addPlan, updatePlan, removePlan, togglePlan } = useAdmin();
  const [open, setOpen] = useState(false); const [editing, setEditing] = useState<string | null>(null);
  const [f, setF] = useState(BLANK); const [err, setErr] = useState("");
  const set = (k: keyof typeof BLANK) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const openNew = () => { setEditing(null); setF(BLANK); setErr(""); setOpen(true); };
  const openEdit = (p: SubPlan) => { setEditing(p.id); setF({ name: p.name, price: String(p.price), routers: p.routers === null ? "" : String(p.routers), customers: p.customers === null ? "" : String(p.customers), sms: String(p.sms) }); setErr(""); setOpen(true); };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(f.price), sms = Number(f.sms);
    const routers = f.routers === "" ? null : Number(f.routers), customers = f.customers === "" ? null : Number(f.customers);
    if (!f.name.trim()) return setErr("Enter a plan name.");
    if (f.price === "" || !(price >= 0)) return setErr("Enter a monthly price of 0 or more.");
    if ((routers !== null && !(Number.isInteger(routers) && routers >= 1)) || (customers !== null && !(Number.isInteger(customers) && customers >= 1))) return setErr("Limits must be whole numbers of 1 or more, or empty for unlimited.");
    if (!(Number.isInteger(sms) && sms >= 0)) return setErr("SMS credits must be 0 or more.");
    const input = { name: f.name.trim(), price, routers, customers, sms };
    if (editing) updatePlan(editing, input); else addPlan(input);
    setOpen(false);
  };
  const lim = (n: number | null) => (n === null ? "Unlimited" : String(n));
  return (
    <>
      <PageHead title="Subscription plans" sub="What operators pay PulseNet" action={<button className="btn inline" onClick={openNew}>+ Create plan</button>} />
      {open && (
        <Card title={editing ? "Edit plan" : "Create a plan"}>
          <form className="fcol" onSubmit={submit}>
            <div className="fgrid">
              <FormField label="Plan name"><input className="fi" value={f.name} onChange={set("name")} /></FormField>
              <FormField label="Price per month (₦)"><input className="fi" type="number" min="0" value={f.price} onChange={set("price")} /></FormField>
              <FormField label="Router limit (empty for unlimited)"><input className="fi" type="number" min="1" value={f.routers} onChange={set("routers")} /></FormField>
              <FormField label="Customer limit (empty for unlimited)"><input className="fi" type="number" min="1" value={f.customers} onChange={set("customers")} /></FormField>
              <FormField label="SMS credits per month"><input className="fi" type="number" min="0" value={f.sms} onChange={set("sms")} /></FormField>
            </div>
            {err && <p className="err" role="alert">{err}</p>}
            <div style={{ display: "flex", gap: 10 }}><button className="btn inline" type="submit">Save plan</button><button className="btn inline ghost" type="button" onClick={() => setOpen(false)}>Cancel</button></div>
          </form>
        </Card>
      )}
      <div className="plans">
        {plans.map((p) => (
          <div className="glass" key={p.id}>
            <div className="row"><span className="ct">{p.name}</span><button className="sw" role="switch" aria-checked={p.active} aria-label={`${p.name} active`} onClick={() => togglePlan(p.id)}><i /></button></div>
            <div style={{ font: "700 28px Inter,sans-serif", margin: "12px 0" }}>{money(p.price)}<span className="muted" style={{ fontSize: 13, fontWeight: 400 }}> / month</span></div>
            <div className="pline"><span className="muted">Routers</span><span>{lim(p.routers)}</span></div>
            <div className="pline"><span className="muted">Customers</span><span>{lim(p.customers)}</span></div>
            <div className="pline"><span className="muted">SMS credits</span><span>{p.sms}</span></div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}><button className="btn inline ghost" onClick={() => openEdit(p)}>Edit</button><button className="linkbtn" onClick={() => { if (confirm(`Delete ${p.name}?`)) removePlan(p.id); }}>Delete</button></div>
          </div>
        ))}
      </div>
      {plans.length === 0 && <Empty>No subscription plans yet. Create the first plan operators can choose.</Empty>}
    </>
  );
}
