"use client";
import { Card, Item, Stat } from "@/components/Cards";
import { Empty, PageHead } from "@/components/ui";
import { useAdmin } from "@/lib/admin-store";
import { day, money } from "@/lib/format";

export default function AdminOverview() {
  const { operators, plans } = useAdmin();
  const month = new Date(); month.setDate(1); month.setHours(0, 0, 0, 0);
  const sys: [string, string][] = [["RADIUS server", "Not connected"], ["Database", "Connected to Supabase Auth"], ["Background worker", "Not connected"], ["Payment gateway", "Not connected"]];
  return (
    <>
      <PageHead title="Platform overview" sub="All operators" />
      <div className="autofit">
        <Stat label="Operators" value={String(operators.length)} note="signed up" />
        <Stat label="Active" value={String(operators.filter((o) => o.status === "active").length)} note="can use the platform" />
        <Stat label="Suspended" value={String(operators.filter((o) => o.status === "suspended").length)} note="access paused" />
        <Stat label="New this month" value={String(operators.filter((o) => o.createdAt >= month.getTime()).length)} note="signed up" />
      </div>
      <div className="grid g21 stack" style={{ alignItems: "start" }}>
        <Card title="Recent operators" href="/admin/operators">
          {operators.slice(0, 5).map((o) => <Item key={o.id} title={o.business || o.name || o.email} sub={`${o.email || "No email"} · ${day(o.createdAt)}`} tag={o.status === "active" ? "Active" : "Suspended"} />)}
          {operators.length === 0 && <Empty>No operators yet. They appear here when someone signs up.</Empty>}
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card title="Platform revenue"><div className="st" style={{ font: "700 26px Inter,sans-serif" }}>{money(0)}</div><div className="muted" style={{ fontSize: 13, marginTop: 4 }}>No subscriptions yet · {plans.length} {plans.length === 1 ? "plan" : "plans"} defined</div></Card>
          <Card title="System status">
            {sys.map(([n, s]) => <div className="pline" key={n}><span className="muted">{n}</span><span>{s}</span></div>)}
            <p className="muted" style={{ fontSize: 12, margin: "10px 0 0" }}>Business data connection is still being wired to the database.</p>
          </Card>
        </div>
      </div>
    </>
  );
}
