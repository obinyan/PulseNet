"use client";
import { useState } from "react";
import { Card, Stat } from "@/components/Cards";
import { Chips, Empty, PageHead } from "@/components/ui";
import { useStore } from "@/lib/store";

const TABS = ["Live", "History"] as const;

export default function SessionsPage() {
  const { sessions, routers, plans } = useStore();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Live");
  const [q, setQ] = useState("");
  const cols = "1.2fr 1.3fr 1fr 1fr 1fr .8fr 1fr .8fr";
  const rows = tab === "Live" ? sessions.filter((s) => `${s.voucher} ${s.device}`.toLowerCase().includes(q.toLowerCase())) : [];
  return (
    <>
      <PageHead title="Sessions" sub={`${sessions.length} active now`} action={<button className="btn inline" disabled style={{ opacity: 0.6 }}>Export</button>} />
      <div className="autofit">
        <Stat label="Active now" value={String(sessions.length)} note="sessions" />
        <Stat label="Data used today" value="0 GB" note="down and up" />
        <Stat label="Average session" value="0 min" note="today" />
      </div>
      <div className="toolbar">
        <Chips items={TABS} value={tab} onChange={setTab} />
        <div className="toolbar">
          <select className="fi" style={{ width: 160 }} aria-label="Router"><option>All routers</option>{routers.map((r) => <option key={r.id}>{r.name}</option>)}</select>
          <select className="fi" style={{ width: 160 }} aria-label="Plan"><option>All plans</option>{plans.map((p) => <option key={p.id}>{p.name}</option>)}</select>
          <input className="fi" placeholder="Search voucher or device" aria-label="Search sessions" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <Card title={tab === "Live" ? "Live sessions" : "Session history"}>
        <div className="scroll"><div style={{ minWidth: 820 }}>
          <div className="tb h" style={{ gridTemplateColumns: cols }}><div>Voucher</div><div>Device</div><div>IP</div><div>Router</div><div>Plan</div><div>Duration</div><div>Data used</div><div /></div>
          {rows.map((s) => (
            <div className="tb" key={s.id} style={{ gridTemplateColumns: cols }}>
              <div><b>{s.voucher}</b></div><div>{s.device}</div><div>{s.ip}</div><div>{s.router}</div><div>{s.plan}</div><div>{s.duration}</div><div>{s.down} / {s.up}</div>
              <div><button className="linkbtn">Disconnect</button></div>
            </div>
          ))}
        </div></div>
        {rows.length === 0 && <Empty>{tab === "Live" ? "No live sessions. Sessions appear here when users connect through a router." : "No session history yet."}</Empty>}
      </Card>
    </>
  );
}
