import { Icon } from "@/components/icons";
import { BarChart, Card, Item, Stat } from "@/components/Cards";

// Sample data only. Replace with real queries once the API exists.
const revenue = [["Mon", 70], ["Tue", 95], ["Wed", 60], ["Thu", 120], ["Fri", 100], ["Sat", 140], ["Sun", 85]].map(([day, value]) => ({ day: day as string, value: value as number }));
const sessions = [["K7P4-XM2R", "Router 1", "1 Day", "1.2 GB"], ["H3WQ-9TNA", "Router 2", "1 Hour", "180 MB"], ["P8DC-5ZLE", "Router 1", "1 Week", "3.4 GB"]];

export default function Overview() {
  return (
    <>
      <div className="row desk-top">
        <div><h1>Overview</h1><div className="muted" style={{ fontSize: 14, marginTop: 4 }}>Sample data, today</div></div>
        <div className="row">
          <button className="iconbtn" aria-label="Notifications"><Icon name="bell" /></button>
          <button className="btn inline">+ New voucher batch</button>
        </div>
      </div>
      <div className="grid g4 stats">
        <Stat label="Revenue today" value="₦48,500" note="+12% vs yesterday" />
        <Stat label="Active users" value="37" note="Peak today: 52" />
        <Stat label="Vouchers sold" value="126" note="312 unused in stock" />
        <Stat label="Routers online" value="3 / 4" note="1 needs attention" />
      </div>
      <div className="grid g21 cards">
        <Card title="Revenue, last 7 days" className="o-chart"><BarChart data={revenue} /></Card>
        <Card title="Routers" href="/dashboard/routers" className="o-routers">
          <Item title="[Router name] 1" sub="[n] users" tag="Online" />
          <Item title="[Router name] 2" sub="[n] users" tag="Online" />
          <Item title="[Router name] 3" sub="Last seen [time]" tag="Offline" />
        </Card>
      </div>
      <div className="grid g21 cards">
        <Card title="Recent sessions" href="/dashboard/sessions" className="o-sessions">
          {sessions.map(([v, r, p, d]) => <Item key={v} title={v} sub={`${r} · ${p}`} tag={d} />)}
        </Card>
        <Card title="Vouchers" href="/dashboard/vouchers" className="o-vouchers">
          <Item title="Unused" sub="312 codes" tag="Stock" />
          <Item title="Batch [name]" sub="[n] vouchers" tag="[Plan]" />
          <Item title="Batch [name]" sub="[n] vouchers" tag="[Plan]" />
        </Card>
      </div>
      <div className="grid g3 cards">
        <Card title="Customers" href="/dashboard/customers" className="o-customers">{[1, 2, 3].map((i) => <Item key={i} title="[Customer name]" sub="[Phone]" tag="[Status]" />)}</Card>
        <Card title="Agents" href="/dashboard/agents" className="o-agents">{[1, 2, 3].map((i) => <Item key={i} title="[Agent name]" sub="[Vouchers sold]" tag="[Status]" />)}</Card>
        <Card title="Plans" href="/dashboard/plans" className="o-plans">{[1, 2, 3].map((i) => <Item key={i} title="[Plan name]" sub="[Price] · [Duration]" tag="[Speed]" />)}</Card>
      </div>
    </>
  );
}
