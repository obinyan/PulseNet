"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, Stat } from "@/components/Cards";
import { Chips, Empty, FormField, PageHead } from "@/components/ui";
import { useStore, type Batch, type VStatus } from "@/lib/store";
import { day } from "@/lib/format";

const FILTERS = ["All", "Unused", "Active", "Used", "Expired", "Disabled"] as const;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export default function VouchersPage() {
  const { plans, vouchers, batches, generate, setVoucherStatus } = useStore();
  const [planId, setPlanId] = useState("");
  const [qty, setQty] = useState("");
  const [prefix, setPrefix] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [q, setQ] = useState("");

  const planName = (id: string) => plans.find((p) => p.id === id)?.name ?? "Deleted plan";
  const count = (s: VStatus) => vouchers.filter((v) => v.status === s).length;
  const list = useMemo(() => vouchers.filter((v) => (filter === "All" || v.status === filter.toLowerCase()) && v.code.toLowerCase().includes(q.toLowerCase())), [vouchers, filter, q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault(); setDone("");
    const n = Number(qty);
    if (!planId) return setError("Choose a plan.");
    if (!Number.isInteger(n) || n < 1 || n > 500) return setError("Quantity must be a whole number from 1 to 500.");
    setError("");
    const b = generate({ planId, qty: n, prefix: prefix.replace(/[^a-z0-9]/gi, "").slice(0, 4), name });
    setDone(`Generated ${b.qty} vouchers in ${b.name}.`); setQty(""); setName("");
  };
  const batchCodes = (b: Batch) => vouchers.filter((v) => v.batchId === b.id).map((v) => v.code);
  const exportCsv = (b: Batch) => {
    const rows = ["Code,Plan", ...batchCodes(b).map((c) => `${c},"${planName(b.planId).replace(/"/g, '""')}"`)].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows], { type: "text/csv" }));
    a.download = `${b.name.replace(/[^a-z0-9]+/gi, "-")}.csv`; a.click(); URL.revokeObjectURL(a.href);
  };
  const print = (b: Batch) => {
    const w = window.open("", "_blank"); if (!w) return;
    w.document.write(`<title>${esc(b.name)}</title><body style="font-family:sans-serif"><h2>${esc(b.name)} (${esc(planName(b.planId))})</h2>${batchCodes(b).map((c) => `<div style="display:inline-block;border:1px dashed #000;padding:10px 14px;margin:6px;font:600 16px monospace">${esc(c)}</div>`).join("")}`);
    w.document.close(); w.print();
  };
  const bc = "1.4fr 1fr .6fr 1fr 1fr", vc = "1.3fr 1fr .9fr 1fr .8fr";

  return (
    <>
      <PageHead title="Vouchers" sub={`${vouchers.length} total`} action={<a className="btn inline" href="#generate" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>+ Generate vouchers</a>} />
      <div className="autofit">
        <Stat label="Unused" value={String(count("unused"))} note="in stock" />
        <Stat label="Active" value={String(count("active"))} note="online now" />
        <Stat label="Used" value={String(count("used"))} note="redeemed" />
        <Stat label="Disabled or expired" value={String(count("disabled") + count("expired"))} note="" />
      </div>
      <div className="fcol" style={{ gap: 16 }}>
        <div id="generate"><Card title="Generate a batch">
          <form className="fcol" onSubmit={submit}>
            <div className="fgrid">
            <FormField label="Plan">
              <select className="fi" value={planId} onChange={(e) => setPlanId(e.target.value)}>
                <option value="">{plans.length ? "Choose a plan" : "No plans yet"}</option>
                {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </FormField>
            <FormField label="Quantity (1 to 500)"><input className="fi" type="number" min="1" max="500" value={qty} onChange={(e) => setQty(e.target.value)} /></FormField>
            <FormField label="Code prefix (optional, up to 4 characters)"><input className="fi" maxLength={4} value={prefix} onChange={(e) => setPrefix(e.target.value)} /></FormField>
            <FormField label="Batch name (optional)"><input className="fi" value={name} onChange={(e) => setName(e.target.value)} /></FormField>
            </div>
            {plans.length === 0 && <p className="muted" style={{ margin: 0, fontSize: 13 }}><Link href="/dashboard/plans" style={{ textDecoration: "underline" }}>Create a plan</Link> first.</p>}
            {error && <p className="err" role="alert">{error}</p>}
            {done && <p style={{ margin: 0, fontSize: 13 }} role="status">{done}</p>}
            <button className="btn inline" type="submit">Generate vouchers</button>
          </form>
        </Card></div>
        <Card title="Batches">
          <div className="scroll"><div style={{ minWidth: 520 }}>
            <div className="tb h" style={{ gridTemplateColumns: bc }}><div>Batch</div><div>Plan</div><div>Qty</div><div>Created</div><div>Export</div></div>
            {batches.map((b) => (
              <div className="tb" key={b.id} style={{ gridTemplateColumns: bc }}>
                <div><b>{b.name}</b></div><div>{planName(b.planId)}</div><div>{b.qty}</div><div>{day(b.createdAt)}</div>
                <div style={{ display: "flex", gap: 10 }}><button className="linkbtn" onClick={() => exportCsv(b)}>CSV</button><button className="linkbtn" onClick={() => print(b)}>Print</button></div>
              </div>
            ))}
          </div></div>
          {batches.length === 0 && <Empty>No batches yet. Generate your first batch.</Empty>}
        </Card>
      </div>
      <div className="toolbar">
        <Chips items={FILTERS} value={filter} onChange={setFilter} />
        <input className="fi" placeholder="Search a code" aria-label="Search a code" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <Card title="All vouchers">
        <div className="scroll"><div style={{ minWidth: 560 }}>
          <div className="tb h" style={{ gridTemplateColumns: vc }}><div>Code</div><div>Plan</div><div>Status</div><div>Created</div><div /></div>
          {list.slice(0, 200).map((v) => (
            <div className="tb" key={v.code} style={{ gridTemplateColumns: vc }}>
              <div><b>{v.code}</b></div><div>{planName(v.planId)}</div>
              <div><span className="pill">{v.status[0].toUpperCase() + v.status.slice(1)}</span></div><div>{day(v.createdAt)}</div>
              <div>{v.status === "disabled" ? <button className="linkbtn" onClick={() => setVoucherStatus(v.code, "unused")}>Enable</button> : <button className="linkbtn" onClick={() => setVoucherStatus(v.code, "disabled")}>Disable</button>}</div>
            </div>
          ))}
        </div></div>
        {list.length === 0 && <Empty>{vouchers.length === 0 ? "No vouchers yet." : "No vouchers match your filter."}</Empty>}
        {list.length > 200 && <Empty>Showing the first 200 of {list.length}. Use search to find a code.</Empty>}
      </Card>
    </>
  );
}
