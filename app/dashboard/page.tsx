"use client";
import { Icon } from "@/components/icons";
import { Card, Item, Stat } from "@/components/Cards";
import { BarChart } from "@/components/BarChart";
import { buckets } from "@/lib/dates";
import { Empty } from "@/components/ui";
import { effStatus, useStore } from "@/lib/store";
import { dur, money } from "@/lib/format";
import Link from "next/link";


export default function Overview() {
  const { ready, routers, plans, vouchers, batches, sessions, payments } = useStore();
  const week = (ready ? buckets("7 days") : []).map((b) => ({ label: b.label, value: payments.filter((p) => p.status === "successful" && p.createdAt >= b.start && p.createdAt < b.end).reduce((n, p) => n + p.amount, 0) }));
  const today = payments.filter((p) => p.status === "successful" && p.createdAt >= new Date().setHours(0, 0, 0, 0)).reduce((n, p) => n + p.amount, 0);
  const online = routers.filter((r) => r.status === "online").length;
  const unused = vouchers.filter((v) => effStatus(v) === "unused").length;
  const sold = vouchers.filter((v) => v.status === "used").length;
  return (
    <>
      <div className="row desk-top">
        <div><h1>Overview</h1><div className="muted" style={{ fontSize: 14, marginTop: 4 }}>Today</div></div>
        <div className="row">
          <button className="iconbtn" aria-label="Notifications"><Icon name="bell" /></button>
          <Link href="/dashboard/vouchers#generate" className="btn inline" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>+ New voucher batch</Link>
        </div>
      </div>
      <div className="grid g4 stats">
        <Stat label="Revenue today" value={money(today)} note={today ? "Paid today" : "No sales yet"} />
        <Stat label="Active users" value={String(sessions.length)} note="Connected now" />
        <Stat label="Vouchers sold" value={String(sold)} note={`${unused} unused in stock`} />
        <Stat label="Routers online" value={`${online} / ${routers.length}`} note={routers.length - online === 0 ? "All routers online" : `${routers.length - online} offline`} />
      </div>
      <div className="grid g21 cards">
        <Card title="Revenue, last 7 days" className="o-chart">{ready ? <BarChart data={week} format={money} tick={(n) => (n >= 1000 ? `₦${+(n / 1000).toFixed(1)}k` : `₦${n}`)} height={260} label="Revenue, last 7 days" emptyText="No revenue recorded yet" /> : <div style={{ height: 260 }} />}</Card>
        <Card title="Routers" href="/dashboard/routers" className="o-routers">
          {routers.slice(0, 3).map((r) => <Item key={r.id} title={r.name} sub={r.site || r.brand} tag={r.status === "online" ? "Online" : "Offline"} />)}
          {routers.length === 0 && <Empty>No routers yet</Empty>}
        </Card>
      </div>
      <div className="grid g21 cards">
        <Card title="Recent sessions" href="/dashboard/sessions" className="o-sessions">
          {sessions.slice(0, 3).map((s) => <Item key={s.id} title={s.voucher} sub={`${s.router} · ${s.plan}`} tag={`${s.down} / ${s.up}`} />)}
          {sessions.length === 0 && <Empty>No sessions yet</Empty>}
        </Card>
        <Card title="Vouchers" href="/dashboard/vouchers" className="o-vouchers">
          <Item title="Unused" sub={`${unused} codes`} tag="Stock" />
          {batches.slice(0, 2).map((b) => <Item key={b.id} title={b.name} sub={`${b.qty} vouchers`} tag={plans.find((p) => p.id === b.planId)?.name ?? "Deleted plan"} />)}
          {batches.length === 0 && <Empty>No batches yet</Empty>}
        </Card>
      </div>
      <div className="grid g3 cards">
        <Card title="Customers" href="/dashboard/customers" className="o-customers"><Empty>No customers yet</Empty></Card>
        <Card title="Agents" href="/dashboard/agents" className="o-agents"><Empty>No agents yet</Empty></Card>
        <Card title="Plans" href="/dashboard/plans" className="o-plans">
          {plans.slice(0, 3).map((p) => <Item key={p.id} title={p.name} sub={`${money(p.price)} · ${dur(p.duration, p.unit)}`} tag={`${p.speed} Mbps`} />)}
          {plans.length === 0 && <Empty>No plans yet</Empty>}
        </Card>
      </div>
    </>
  );
}
