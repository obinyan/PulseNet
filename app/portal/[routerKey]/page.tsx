"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { dur, money } from "@/lib/format";
import { effStatus, useStore, type Plan } from "@/lib/store";

const HEX = /^#[0-9a-f]{6}$/i;

export default function CustomerLoginPage() {
  const { routerKey } = useParams<{ routerKey: string }>();
  const { ready, settings, plans, vouchers, routers, setVoucherStatus } = useStore();
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState<{ plan?: Plan; code: string } | null>(null);

  const b = settings.branding;
  const p = HEX.test(b.primary) ? b.primary : "#3b50c8", a = HEX.test(b.accent) ? b.accent : "#8ea0ff";
  const bg = `linear-gradient(160deg, color-mix(in srgb, ${p} 40%, black), ${p})`;
  const known = routerKey === "preview" || routers.some((r) => r.id === routerKey);
  const active = plans.filter((x) => x.active);

  const connect = (e: React.FormEvent) => {
    e.preventDefault();
    const c = code.trim().toLowerCase();
    if (!c) return setErr("Enter your voucher code.");
    const v = vouchers.find((x) => x.code.toLowerCase() === c);
    if (!v) return setErr("That code was not found. Check it and try again.");
    const s = effStatus(v);
    if (s === "disabled") return setErr("This voucher has been disabled. Contact support.");
    if (s === "expired") return setErr("This voucher has expired.");
    if (s === "used") return setErr("This voucher has already been used.");
    if (s === "unused") setVoucherStatus(v.code, "active");
    setErr(""); setOk({ plan: plans.find((x) => x.id === v.planId), code: v.code });
  };

  return (
    <main style={{ minHeight: "100vh", background: bg, padding: "28px 16px", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", gap: 16 }}>
        {!ready ? null : !known ? (
          <section className="glass" style={{ textAlign: "center" }}><h1 style={{ font: "600 22px Inter,sans-serif", margin: "0 0 8px" }}>This hotspot is not set up</h1><p className="muted" style={{ margin: 0 }}>The link is not valid. Ask the owner of this Wi-Fi for help.</p></section>
        ) : (
          <>
            <header style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, paddingTop: 8 }}>
              {b.logo && <img src={b.logo} alt="" style={{ maxWidth: 120, maxHeight: 72, objectFit: "contain" }} />}
              <h1 style={{ font: "700 26px Inter,sans-serif", margin: 0 }}>{b.title || b.businessName || "Welcome"}</h1>
              {b.message && <p className="muted" style={{ margin: 0, fontSize: 15 }}>{b.message}</p>}
            </header>

            {ok ? (
              <section className="glass" role="status" style={{ textAlign: "center" }}>
                <h2 style={{ font: "600 20px Inter,sans-serif", margin: "0 0 8px" }}>You are connected</h2>
                {ok.plan && <p style={{ margin: "0 0 4px" }}>{ok.plan.name}: {dur(ok.plan.duration, ok.plan.unit)} at {ok.plan.speed} Mbps{ok.plan.dataGb ? `, ${ok.plan.dataGb} GB` : ""}</p>}
                <p className="muted" style={{ margin: 0, fontSize: 13 }}>Voucher {ok.code}</p>
                <p className="muted" style={{ margin: "12px 0 0", fontSize: 12 }}>Test mode: no router is connected, so this login is simulated.</p>
              </section>
            ) : (
              <form className="glass" onSubmit={connect} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <label><span className="lb">Voucher code</span><input className="fi" value={code} onChange={(e) => setCode(e.target.value)} autoCapitalize="characters" autoComplete="off" spellCheck={false} placeholder="Enter your voucher code" /></label>
                {err && <p className="err" role="alert" style={{ margin: 0 }}>{err}</p>}
                <button className="btn" type="submit" style={{ background: a, borderColor: a }}>{b.button || "Connect"}</button>
              </form>
            )}

            {!ok && (
              <section className="glass" aria-label="Buy a plan">
                <h2 style={{ font: "600 16px Inter,sans-serif", margin: "0 0 10px" }}>Or buy a plan</h2>
                {active.map((x) => (
                  <div className="item" key={x.id}>
                    <div><b>{x.name}</b><small>{dur(x.duration, x.unit)} · {x.speed} Mbps{x.dataGb ? ` · ${x.dataGb} GB` : ""}</small></div>
                    <button className="btn inline ghost" disabled style={{ opacity: 0.6, height: 38 }} aria-label={`Buy ${x.name} for ${money(x.price)}`}>{money(x.price)}</button>
                  </div>
                ))}
                {active.length === 0 && <p className="empty">No plans are available yet.</p>}
                {active.length > 0 && <p className="muted" style={{ fontSize: 12, margin: "10px 0 0" }}>Online payment is not connected yet. Use a voucher for now.</p>}
              </section>
            )}
            {b.support && <p className="muted" style={{ textAlign: "center", fontSize: 13, margin: 0 }}>Need help? {b.support}</p>}
          </>
        )}
      </div>
    </main>
  );
}
