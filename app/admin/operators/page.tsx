"use client";
import { useMemo, useState } from "react";
import { Card } from "@/components/Cards";
import { Chips, Empty, PageHead } from "@/components/ui";
import { useAdmin } from "@/lib/admin-store";
import { day } from "@/lib/format";

const FILTERS = ["All", "Active", "Suspended"] as const;

export default function OperatorsPage() {
  const { operators, setStatus, operatorError, ready } = useAdmin();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [q, setQ] = useState(""); const [sel, setSel] = useState<string | null>(null);
  const list = useMemo(() => operators.filter((o) => (filter === "All" || o.status === filter.toLowerCase()) && `${o.business} ${o.name} ${o.email} ${o.phone}`.toLowerCase().includes(q.toLowerCase())), [operators, filter, q]);
  const cur = operators.find((o) => o.id === sel);
  const cols = "1.5fr 1.2fr 1.5fr 1.1fr 1fr .9fr 1.1fr";
  return (
    <>
      <PageHead title="Operators" sub={`${operators.length} ${operators.length === 1 ? "operator" : "operators"}`} />
      <div className="toolbar">
        <Chips items={FILTERS} value={filter} onChange={setFilter} />
        <input className="fi" placeholder="Search operators" aria-label="Search operators" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {operatorError && <p className="err" role="alert">{operatorError}</p>}
      <div className="grid g21 stack" style={{ alignItems: "start" }}>
        <Card title="All operators">
          <div className="scroll"><div style={{ minWidth: 820 }}>
            <div className="tb h" style={{ gridTemplateColumns: cols }}><div>Business</div><div>Owner</div><div>Email</div><div>Phone</div><div>Joined</div><div>Status</div><div /></div>
            {list.map((o) => (
              <div className="tb" key={o.id} style={{ gridTemplateColumns: cols }}>
                <div><b>{o.business || "Unnamed"}</b></div><div>{o.name || "None"}</div><div style={{ overflowWrap: "anywhere" }}>{o.email || "None"}</div><div>{o.phone || "None"}</div><div>{day(o.createdAt)}</div>
                <div><span className="pill">{o.status === "active" ? "Active" : "Suspended"}</span></div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="linkbtn" onClick={() => setSel(o.id)}>View</button>
                  <button className="linkbtn" onClick={() => setStatus(o.id, o.status === "active" ? "suspended" : "active")}>{o.status === "active" ? "Suspend" : "Activate"}</button>
                </div>
              </div>
            ))}
          </div></div>
          {list.length === 0 && <Empty>{!ready ? "Loading operators…" : operators.length === 0 ? "No operators yet. They appear here when someone signs up." : "No operators match your filter."}</Empty>}
        </Card>
        <Card title="Operator details">
          {cur ? (
            <>
              <div className="pline"><span className="muted">Business</span><span>{cur.business || "Unnamed"}</span></div>
              <div className="pline"><span className="muted">Owner</span><span>{cur.name || "None"}</span></div>
              <div className="pline"><span className="muted">Email</span><span style={{ overflowWrap: "anywhere", textAlign: "right" }}>{cur.email || "None"}</span></div>
              <div className="pline"><span className="muted">Phone</span><span>{cur.phone || "None"}</span></div>
              <div className="pline"><span className="muted">Joined</span><span>{day(cur.createdAt)}</span></div>
              <div className="pline"><span className="muted">Status</span><span>{cur.status === "active" ? "Active" : "Suspended"}</span></div>
              <p className="muted" style={{ fontSize: 12, margin: "10px 0" }}>Operator records and status are loaded from Supabase. Routers, customers and revenue are not connected yet.</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn inline ghost" onClick={() => setStatus(cur.id, cur.status === "active" ? "suspended" : "active")}>{cur.status === "active" ? "Suspend" : "Activate"}</button>
              </div>
            </>
          ) : <Empty>Select an operator to see their details.</Empty>}
        </Card>
      </div>
    </>
  );
}
