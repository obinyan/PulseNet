"use client";
import { Card } from "@/components/Cards";
import { Empty } from "@/components/ui";
import { useStore } from "@/lib/store";

export function Billing() {
  const { routers, customers, vouchers } = useStore();
  const rows: [string, number][] = [["Routers", routers.length], ["Customers", customers.length], ["Vouchers generated", vouchers.length]];
  const cols = "1.2fr 1fr 1fr 1fr .6fr";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="grid g21 stack" style={{ alignItems: "start" }}>
        <Card title="Current subscription">
          <div className="row"><div><b style={{ fontSize: 20 }}>No subscription yet</b><div className="muted" style={{ fontSize: 13 }}>PulseNet pricing is set when billing is connected.</div></div></div>
          {rows.map(([l, n]) => (
            <div key={l} style={{ margin: "14px 0" }}>
              <div className="row" style={{ fontSize: 13, marginBottom: 4 }}><span>{l}</span><span className="muted">{n} in use</span></div>
              <div className="bar"><i style={{ width: n ? "6%" : "0%" }} /></div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><button className="btn inline" disabled style={{ opacity: 0.6 }}>Upgrade plan</button><button className="btn inline ghost" disabled style={{ opacity: 0.6 }}>Cancel subscription</button></div>
        </Card>
        <Card title="Payment method">
          <div className="pline"><span className="muted">Card</span><span>None</span></div>
          <div className="pline"><span className="muted">Billing email</span><span>None</span></div>
          <button className="btn ghost" disabled style={{ opacity: 0.6, marginTop: 14 }}>Update payment method</button>
        </Card>
      </div>
      <Card title="Available plans"><Empty>Subscription plans for PulseNet will be listed here once pricing is decided.</Empty></Card>
      <Card title="Invoices">
        <div className="scroll"><div style={{ minWidth: 480 }}><div className="tb h" style={{ gridTemplateColumns: cols }}><div>Invoice</div><div>Date</div><div>Amount</div><div>Status</div><div /></div></div></div>
        <Empty>No invoices yet.</Empty>
      </Card>
    </div>
  );
}
