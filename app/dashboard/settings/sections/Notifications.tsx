"use client";
import { useState } from "react";
import { Card, Item } from "@/components/Cards";
import { Empty, Switch } from "@/components/ui";
import { NOTIFY_EVENTS, useStore } from "@/lib/store";

type Ch = "email" | "sms" | "app";
const uid = () => Math.random().toString(36).slice(2, 10);

export function Notifications() {
  const { settings, updateSettings } = useStore();
  const n = settings.notifications;
  const [v, setV] = useState(""); const [err, setErr] = useState("");
  const toggle = (k: string, ch: Ch, on: boolean) => updateSettings("notifications", { ...n, events: { ...n.events, [k]: { ...n.events[k], [ch]: on } } });
  const add = (e: React.FormEvent) => {
    e.preventDefault(); const val = v.trim();
    const type = /^\S+@\S+\.\S+$/.test(val) ? "email" : /^\+?[0-9 ]{7,15}$/.test(val) ? "sms" : null;
    if (!type) return setErr("Enter a valid email address or phone number.");
    setErr(""); updateSettings("notifications", { ...n, recipients: [...n.recipients, { id: uid(), type, value: val }] }); setV("");
  };
  const cols = "2fr .7fr .7fr .7fr";
  return (
    <div className="grid g21 stack" style={{ alignItems: "start" }}>
      <Card title="Alert channels">
        <p className="muted" style={{ margin: "0 0 8px", fontSize: 13 }}>Changes save as you switch them.</p>
        <div className="scroll"><div style={{ minWidth: 420 }}>
          <div className="tb h" style={{ gridTemplateColumns: cols }}><div>Event</div><div>Email</div><div>SMS</div><div>In-app</div></div>
          {NOTIFY_EVENTS.map(([k, label]) => (
            <div className="tb" key={k} style={{ gridTemplateColumns: cols }}>
              <div><b>{label}</b></div>
              {(["email", "sms", "app"] as Ch[]).map((ch) => <div key={ch}><Switch on={n.events[k]?.[ch] ?? false} onChange={(on) => toggle(k, ch, on)} label={`${label}: ${ch}`} /></div>)}
            </div>
          ))}
        </div></div>
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card title="Recipients">
          {n.recipients.map((r) => (
            <div className="item" key={r.id}><div><b>{r.value}</b><small>{r.type === "email" ? "Email" : "SMS"}</small></div><button className="linkbtn" onClick={() => updateSettings("notifications", { ...n, recipients: n.recipients.filter((x) => x.id !== r.id) })}>Remove</button></div>
          ))}
          {n.recipients.length === 0 && <Empty>No recipients yet.</Empty>}
          <form onSubmit={add} style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <input className="fi" placeholder="Add email or phone" aria-label="Add recipient" value={v} onChange={(e) => setV(e.target.value)} />
            <button className="btn inline" type="submit">Add</button>
          </form>
          {err && <p className="err" role="alert" style={{ marginTop: 8 }}>{err}</p>}
        </Card>
        <Card title="SMS credits">
          <div className="pline"><span className="muted">Balance</span><span>0</span></div>
          <div className="pline"><span className="muted">Used this month</span><span>0</span></div>
          <button className="btn" disabled style={{ opacity: 0.6, marginTop: 14 }}>Top up credits</button>
          <p className="muted" style={{ fontSize: 12, margin: "8px 0 0" }}>Alerts are sent once the backend and an SMS provider are connected.</p>
        </Card>
      </div>
    </div>
  );
}
