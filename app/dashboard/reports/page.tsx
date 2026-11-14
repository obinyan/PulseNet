"use client";
import { useMemo, useState } from "react";
import { Card, Item, Stat } from "@/components/Cards";
import { BarChart } from "@/components/BarChart";
import { Chips, Empty, PageHead } from "@/components/ui";
import { useStore } from "@/lib/store";
import { buckets, type Period } from "@/lib/dates";
import { downloadCsv } from "@/lib/export";
import { day, money } from "@/lib/format";

const PERIODS = ["Today", "7 days", "30 days"] as const;

export default function ReportsPage() {
  const { ready, payments, plans, routers, customers, agents, batches, vouchers } = useStore();
  const [period, setPeriod] = useState<Period>("7 days");
  const [planFilter, setPlanFilter] = useState("All plans");

  const bk = useMemo(() => (ready ? buckets(period) : []), [ready, period]);
  const inPeriod = useMemo(() => {
    if (!bk.length) return [];
    const from = bk[0].start, to = bk[bk.length - 1].end;
    return payments.filter((p) => p.status === "successful" && p.createdAt >= from && p.createdAt < to && (planFilter === "All plans" || p.plan === planFilter));
  }, [payments, bk, planFilter]);
  const series = bk.map((b) => ({ label: b.label, value: inPeriod.filter((p) => p.createdAt >= b.start && p.createdAt < b.end).reduce((n, p) => n + p.amount, 0) }));
  const revenue = inPeriod.reduce((n, p) => n + p.amount, 0);
  const byPlan = useMemo(() => { const m: Record<string, number> = {}; inPeriod.forEach((p) => { m[p.plan] = (m[p.plan] || 0) + p.amount; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); }, [inPeriod]);
  const topRouters = [...routers].filter((r) => r.users > 0).sort((a, b) => b.users - a.users).slice(0, 3);
  const topCustomers = [...customers].filter((c) => c.dataMb > 0).sort((a, b) => b.dataMb - a.dataMb).slice(0, 3);
  const topAgents = agents.map((a) => {
    const b = batches.find((x) => x.id === a.batchId);
    const sold = b ? vouchers.filter((v) => v.batchId === b.id && v.status === "used").length : 0;
    return { a, sold, sales: sold * (plans.find((p) => p.id === b?.planId)?.price ?? 0) };
  }).filter((x) => x.sold > 0).sort((a, b) => b.sales - a.sales).slice(0, 3);
  const maxPlan = byPlan[0]?.[1] || 1;

  return (
    <>
      <PageHead title="Reports" sub="Revenue, sales and usage" action={<button className="btn inline" disabled={!inPeriod.length} style={{ opacity: inPeriod.length ? 1 : 0.6 }} onClick={() => downloadCsv("revenue.csv", [["Reference", "Plan", "Amount", "Date"], ...inPeriod.map((p) => [p.reference, p.plan, String(p.amount), day(p.createdAt)])])}>Export CSV</button>} />
      <div className="toolbar">
        <Chips items={PERIODS} value={period} onChange={setPeriod} />
        <select className="fi" style={{ width: 180 }} aria-label="Plan" value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
          <option>All plans</option>{plans.map((p) => <option key={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div className="autofit">
        <Stat label="Revenue" value={money(revenue)} note={period === "Today" ? "today" : `last ${period}`} />
        <Stat label="Vouchers sold" value={String(inPeriod.length)} note="paid sales" />
        <Stat label="Data used" value="0 GB" note="down and up" />
        <Stat label="Peak users" value="0" note="at once" />
      </div>
      <div className="grid g21 stack" style={{ alignItems: "start" }}>
        <Card title="Revenue over time">
          {ready ? <BarChart data={series} format={money} tick={(n) => (n >= 1000 ? `₦${+(n / 1000).toFixed(1)}k` : `₦${n}`)} height={300} label="Revenue over time" emptyText="No revenue recorded in this period" /> : <div style={{ height: 300 }} />}
        </Card>
        <Card title="Sales by plan">
          {byPlan.map(([name, v]) => (
            <div key={name} style={{ margin: "12px 0" }}>
              <div className="row" style={{ fontSize: 13, marginBottom: 4 }}><span>{name}</span><span className="muted">{money(v)}</span></div>
              <div className="rbar"><i style={{ width: `${(v / maxPlan) * 100}%` }} /></div>
            </div>
          ))}
          {byPlan.length === 0 && <Empty>No sales in this period</Empty>}
        </Card>
      </div>
      <div className="grid g3 stack">
        <Card title="Top routers">
          {topRouters.map((r) => <Item key={r.id} title={r.name} sub={r.site || r.brand} tag={`${r.users} users`} />)}
          {topRouters.length === 0 && <Empty>No router activity yet</Empty>}
        </Card>
        <Card title="Top customers by usage">
          {topCustomers.map((c) => <Item key={c.id} title={c.name} sub={c.phone} tag={`${+(c.dataMb / 1024).toFixed(1)} GB`} />)}
          {topCustomers.length === 0 && <Empty>No usage yet</Empty>}
        </Card>
        <Card title="Sales by agent">
          {topAgents.map(({ a, sold, sales }) => <Item key={a.id} title={a.name} sub={`${sold} vouchers`} tag={money(sales)} />)}
          {topAgents.length === 0 && <Empty>No agent sales yet</Empty>}
        </Card>
      </div>
    </>
  );
}
