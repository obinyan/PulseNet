"use client";
import { useMemo, useState } from "react";
import { Card, Stat } from "@/components/Cards";
import { Chips, Empty, PageHead } from "@/components/ui";
import { useStore, type Payment } from "@/lib/store";
import { day, money } from "@/lib/format";
import { downloadCsv, esc } from "@/lib/export";

const FILTERS = ["All", "Successful", "Pending", "Failed"] as const;
const RANGES = { "All time": 0, Today: 1, "7 days": 7, "30 days": 30 } as const;

export default function PaymentsPage() {
  const { payments } = useStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [range, setRange] = useState<keyof typeof RANGES>("All time");
  const [q, setQ] = useState("");
  const sum = (days: number) => { const t = new Date(); t.setHours(0, 0, 0, 0); const from = t.getTime() - (days - 1) * 86400000; return payments.filter((p) => p.status === "successful" && p.createdAt >= from).reduce((n, p) => n + p.amount, 0); };
  const pending = payments.filter((p) => p.status === "pending");
  const list = useMemo(() => {
    const d = RANGES[range]; const t = new Date(); t.setHours(0, 0, 0, 0); const from = d ? t.getTime() - (d - 1) * 86400000 : 0;
    return payments.filter((p) => (filter === "All" || p.status === filter.toLowerCase()) && p.createdAt >= from && `${p.reference} ${p.customer}`.toLowerCase().includes(q.toLowerCase()));
  }, [payments, filter, range, q]);
  const receipt = (p: Payment) => {
    const w = window.open("", "_blank"); if (!w) return;
    w.document.write(`<title>Receipt ${esc(p.reference)}</title><body style="font-family:sans-serif;max-width:420px;margin:40px auto"><h2>Receipt</h2><p>Reference: ${esc(p.reference)}<br>Customer: ${esc(p.customer)}<br>Plan: ${esc(p.plan)}<br>Amount: ${esc(money(p.amount))}<br>Date: ${esc(day(p.createdAt))}</p>`);
    w.document.close(); w.print();
  };
  const cols = "1.2fr 1.4fr 1fr .9fr .9fr .9fr 1fr .6fr";
  return (
    <>
      <PageHead title="Payments" sub="Transactions and receipts" action={<button className="btn inline" disabled={!payments.length} style={{ opacity: payments.length ? 1 : 0.6 }} onClick={() => downloadCsv("payments.csv", [["Reference", "Customer", "Plan", "Amount", "Method", "Status", "Date"], ...list.map((p) => [p.reference, p.customer, p.plan, String(p.amount), p.method, p.status, day(p.createdAt)])])}>Export</button>} />
      <div className="autofit">
        <Stat label="Today" value={money(sum(1))} note="revenue" />
        <Stat label="This week" value={money(sum(7))} note="revenue" />
        <Stat label="This month" value={money(sum(30))} note="revenue" />
        <Stat label="Pending" value={money(pending.reduce((n, p) => n + p.amount, 0))} note={`${pending.length} awaiting confirmation`} />
      </div>
      <div className="toolbar">
        <Chips items={FILTERS} value={filter} onChange={setFilter} />
        <div className="toolbar">
          <select className="fi" style={{ width: 150 }} aria-label="Date range" value={range} onChange={(e) => setRange(e.target.value as keyof typeof RANGES)}>{Object.keys(RANGES).map((r) => <option key={r}>{r}</option>)}</select>
          <input className="fi" placeholder="Search reference or customer" aria-label="Search payments" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <div className="grid g21 stack" style={{ alignItems: "start" }}>
        <Card title="Transactions">
          <div className="scroll"><div style={{ minWidth: 760 }}>
            <div className="tb h" style={{ gridTemplateColumns: cols }}><div>Reference</div><div>Customer</div><div>Plan</div><div>Amount</div><div>Method</div><div>Status</div><div>Date</div><div /></div>
            {list.map((p) => (
              <div className="tb" key={p.id} style={{ gridTemplateColumns: cols }}>
                <div>{p.reference}</div><div><b>{p.customer}</b></div><div>{p.plan}</div><div>{money(p.amount)}</div><div>{p.method}</div>
                <div><span className="pill">{p.status[0].toUpperCase() + p.status.slice(1)}</span></div><div>{day(p.createdAt)}</div>
                <div><button className="linkbtn" onClick={() => receipt(p)}>Receipt</button></div>
              </div>
            ))}
          </div></div>
          {list.length === 0 && <Empty>{payments.length === 0 ? "No transactions yet." : "No transactions match your filter."}</Empty>}
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card title="Payment gateway">
            <div className="row" style={{ marginBottom: 12 }}><b>Paystack</b><span className="pill">Not connected</span></div>
            <p className="muted" style={{ margin: "0 0 14px", fontSize: 14 }}>Connecting a gateway lets customers pay online and get access automatically. It needs the backend, which comes in a later phase.</p>
            <button className="btn" disabled style={{ opacity: 0.6 }}>Connect gateway</button>
          </Card>
          <Card title="Settlement">
            <div className="pline"><span className="muted">Available balance</span><span>{money(0)}</span></div>
            <div className="pline"><span className="muted">Next payout</span><span>None</span></div>
            <div className="pline"><span className="muted">Bank account</span><span>Not set</span></div>
          </Card>
        </div>
      </div>
    </>
  );
}
