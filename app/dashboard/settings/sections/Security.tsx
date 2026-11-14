"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/Cards";
import { FormField, ToggleRow } from "@/components/ui";
import { useStore } from "@/lib/store";

function device() {
  const ua = navigator.userAgent;
  const b = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const o = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Mac/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "device";
  return `${b} on ${o}`;
}

export function Security() {
  const { resetAll } = useStore();
  const [dev, setDev] = useState("");
  const [typed, setTyped] = useState("");
  useEffect(() => setDev(device()), []);
  const cols = "1.4fr 1.2fr .8fr";
  return (
    <div className="grid g21 stack" style={{ alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card title="Change password">
          <div className="fcol">
            <FormField label="Current password"><input className="fi" type="password" disabled style={{ opacity: 0.6 }} /></FormField>
            <FormField label="New password"><input className="fi" type="password" disabled style={{ opacity: 0.6 }} /></FormField>
            <FormField label="Confirm new password"><input className="fi" type="password" disabled style={{ opacity: 0.6 }} /></FormField>
            <button className="btn inline" disabled style={{ opacity: 0.6 }}>Update password</button>
            <p className="muted" style={{ fontSize: 12, margin: 0 }}>Passwords are managed once login is connected to the backend. Right now, signing in is open for testing.</p>
          </div>
        </Card>
        <Card title="Where you are logged in">
          <div className="scroll"><div style={{ minWidth: 380 }}>
            <div className="tb h" style={{ gridTemplateColumns: cols }}><div>Device</div><div>Status</div><div /></div>
            <div className="tb" style={{ gridTemplateColumns: cols }}><div><b>{dev || "This device"}</b></div><div><span className="pill">This device</span></div><div /></div>
          </div></div>
          <button className="btn ghost" disabled style={{ opacity: 0.6, marginTop: 12 }}>Sign out of all devices</button>
        </Card>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card title="Two-factor">
          <ToggleRow title="Two-factor authentication" hint="Ask for an authenticator code when logging in" on={false} onChange={() => {}} disabled />
          <p className="muted" style={{ fontSize: 12, margin: "8px 0 0" }}>Available once accounts are handled by the backend.</p>
        </Card>
        <Card title="Delete all data">
          <p className="muted" style={{ fontSize: 14, marginTop: 0 }}>Removes the routers, plans, vouchers, agents, team and settings saved in this browser. This cannot be undone. Type DELETE to confirm.</p>
          <input className="fi" aria-label="Type DELETE to confirm" value={typed} onChange={(e) => setTyped(e.target.value)} />
          <button className="btn" disabled={typed !== "DELETE"} style={{ marginTop: 12, opacity: typed === "DELETE" ? 1 : 0.6, background: "rgba(255,120,140,.4)", color: "#fff", borderColor: "rgba(255,160,175,.6)" }} onClick={() => { resetAll(); setTyped(""); }}>Delete all data</button>
        </Card>
      </div>
    </div>
  );
}
