"use client";
import { useMemo, useState } from "react";
import { Card, Item, Stat } from "@/components/Cards";
import { Chips, Empty, PageHead } from "@/components/ui";
import { useStore } from "@/lib/store";
import { money, when, day } from "@/lib/format";
import { downloadCsv } from "@/lib/export";

const FILTERS = ["All", "Online", "Blocked"] as const;

export default function CustomersPage() {
  const { customers } = useStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const list = useMemo(() => customers.filter((c) => (filter === "All" || c.status === filter.toLowerCase()) && `${c.name} ${c.phone} ${c.device}`.toLowerCase().includes(q.toLowerCase())), [customers, filter, q]);
  const cur = customers.find((c) => c.id === sel);
  const weekAgo = Date.now() - 7 * 86400000;
  const cols = "1.6fr 1.2fr 1fr 1fr 1.1fr .9fr .6fr";
  return (
    <>
      <PageHead title="Customers" sub={`${customers.length} ${customers.length === 1 ? "customer" : "customers"}`} action={<button className="btn inline" disabled={!customers.length} style={{ opacity: customers.length ? 1 : 0.6 }} onClick={() => downloadCsv("customers.csv", [["Name", "Phone", "Device", "Status", "Total spent"], ...customers.map((c) => [c.name, c.phone, c.device, c.status, String(c.spent)])])}>Export</button>} />
      <div className="autofit">
        <Stat label="Total customers" value={String(customers.length)} note="all time" />
        <Stat label="Online now" value={String(customers.filter((c) => c.status === "online").length)} note="connected" />
        <Stat label="Blocked" value={String(customers.filter((c) => c.status === "blocked").length)} note="denied access" />
        <Stat label="New this week" value={String(customers.filter((c) => c.firstSeen > weekAgo).length)} note="first seen" />
      </div>
      <div className="toolbar">
        <Chips items={FILTERS} value={filter} onChange={setFilter} />
        <input className="fi" placeholder="Search name, phone or device" aria-label="Search customers" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="grid g21 stack" style={{ alignItems: "start" }}>
        <Card title="All customers">
          <div className="scroll"><div style={{ minWidth: 720 }}>
            <div className="tb h" style={{ gridTemplateColumns: cols }}><div>Customer</div><div>Device</div><div>Last voucher</div><div>Total spent</div><div>Last seen</div><div>Status</div><div /></div>
            {list.map((c) => (
              <div className="tb" key={c.id} style={{ gridTemplateColumns: cols }}>
                <div><b>{c.name}</b><div className="muted" style={{ fontSize: 12 }}>{c.phone}</div></div><div>{c.device}</div><div>{c.lastVoucher || "None"}</div><div>{money(c.spent)}</div><div>{when(c.lastSeen)}</div>
                <div><span className="pill">{c.status[0].toUpperCase() + c.status.slice(1)}</span></div>
                <div><button className="linkbtn" onClick={() => setSel(c.id)}>View</button></div>
              </div>
            ))}
          </div></div>
          {list.length === 0 && <Empty>{customers.length === 0 ? "No customers yet. People appear here after they connect and use a voucher." : "No customers match your filter."}</Empty>}
        </Card>
        <Card title="Customer details">
          {cur ? (
            <>
              <Item title={cur.name} sub={cur.phone} tag={cur.status} />
              <div className="pline"><span className="muted">Device</span><span>{cur.device}</span></div>
              <div className="pline"><span className="muted">Total spent</span><span>{money(cur.spent)}</span></div>
              <div className="pline"><span className="muted">First seen</span><span>{day(cur.firstSeen)}</span></div>
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button className="btn ghost" disabled style={{ opacity: 0.6 }} title="Available once routers are connected">Disconnect</button>
                <button className="btn ghost" disabled style={{ opacity: 0.6 }} title="Available once routers are connected">Block</button>
              </div>
            </>
          ) : <Empty>Select a customer to see their details</Empty>}
        </Card>
      </div>
    </>
  );
}
