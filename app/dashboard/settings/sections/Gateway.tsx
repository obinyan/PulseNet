"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/Cards";
import { FormField, ToggleRow } from "@/components/ui";
import { useStore, type Settings } from "@/lib/store";

type G = Settings["gateway"];
const BANKS = ["Access Bank", "First Bank", "GTBank", "Kuda", "Moniepoint", "Opay", "Palmpay", "Stanbic IBTC", "UBA", "Wema Bank", "Zenith Bank"];

export function Gateway() {
  const { settings, updateSettings, ready } = useStore();
  const [d, setD] = useState<G>(settings.gateway);
  const [err, setErr] = useState(""); const [saved, setSaved] = useState(false); const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  useEffect(() => { setOrigin(window.location.origin); }, []);
  useEffect(() => { if (ready) setD(settings.gateway); }, [ready, settings.gateway]);
  const up = (p: Partial<G>) => { setD({ ...d, ...p }); setSaved(false); };
  const hook = `${origin}/api/webhooks/${d.provider}`;
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (d.accountNumber && !/^\d{10}$/.test(d.accountNumber)) return setErr("Account number must be 10 digits.");
    setErr(""); updateSettings("gateway", d); setSaved(true);
  };
  const steps = ["Create a gateway account", "Paste your keys and verify", "Add the webhook URL", "Make a test payment"];
  return (
    <form className="grid g21 stack" style={{ alignItems: "start" }} onSubmit={save}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card title="Connect a gateway">
          <div className="fcol">
            <div className="two">
              {(["paystack", "flutterwave"] as const).map((p) => (
                <button type="button" key={p} className={`opt ${d.provider === p ? "on" : ""}`} aria-pressed={d.provider === p} onClick={() => up({ provider: p })}>
                  <b>{p === "paystack" ? "Paystack" : "Flutterwave"}</b><div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{p === "paystack" ? "Cards, bank transfer, USSD" : "Cards, bank transfer, mobile money"}</div>
                </button>
              ))}
            </div>
            <ToggleRow title="Live mode" hint="Off means test payments only" on={d.live} onChange={(v) => up({ live: v })} />
            <FormField label="Public key"><input className="fi" placeholder={d.provider === "paystack" ? "pk_..." : "FLWPUBK-..."} value={d.publicKey} onChange={(e) => up({ publicKey: e.target.value.trim() })} /></FormField>
            <FormField label="Secret key"><input className="fi" disabled placeholder="Added on the server when the backend is connected" style={{ opacity: 0.6 }} /></FormField>
            <FormField label="Webhook URL (give this to your gateway)"><input className="fi" readOnly value={hook} onFocus={(e) => e.target.select()} /></FormField>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" className="btn inline" disabled style={{ opacity: 0.6 }}>Verify connection</button>
              <button type="button" className="btn inline ghost" onClick={async () => { try { await navigator.clipboard.writeText(hook); setCopied(true); } catch { setCopied(false); } }}>{copied ? "Copied" : "Copy webhook URL"}</button>
            </div>
            <p className="muted" style={{ fontSize: 12, margin: 0 }}>Secret keys must never be stored in the browser. Verification and the webhook address work once the backend exists.</p>
          </div>
        </Card>
        <Card title="Payment methods">
          <ToggleRow title="Card" hint="Visa, Mastercard, Verve" on={d.card} onChange={(v) => up({ card: v })} />
          <ToggleRow title="Bank transfer" hint="Pay by transfer" on={d.transfer} onChange={(v) => up({ transfer: v })} />
          <ToggleRow title="USSD" hint="Pay from any phone" on={d.ussd} onChange={(v) => up({ ussd: v })} />
          <ToggleRow title="Customer pays the gateway fee" hint="Adds the fee on top of the plan price" on={d.customerPaysFee} onChange={(v) => up({ customerPaysFee: v })} />
        </Card>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card title="Status">
          <div className="pline"><span className="muted">Connection</span><span>Not connected</span></div>
          <div className="pline"><span className="muted">Mode</span><span>{d.live ? "Live" : "Test"}</span></div>
          <div className="pline"><span className="muted">Last webhook</span><span>None</span></div>
        </Card>
        <Card title="Setup checklist">
          {steps.map((t, i) => <div key={t} className="trow" style={{ justifyContent: "flex-start" }}><span className="pill">{i + 1}</span><span style={{ fontSize: 14 }}>{t}</span></div>)}
        </Card>
        <Card title="Settlement account">
          <div className="fcol">
            <FormField label="Bank"><select className="fi" value={d.bank} onChange={(e) => up({ bank: e.target.value })}><option value="">Choose a bank</option>{BANKS.map((b) => <option key={b}>{b}</option>)}</select></FormField>
            <FormField label="Account number"><input className="fi" inputMode="numeric" maxLength={10} value={d.accountNumber} onChange={(e) => up({ accountNumber: e.target.value.replace(/\D/g, "") })} /></FormField>
            <FormField label="Account name"><input className="fi" value={d.accountName} onChange={(e) => up({ accountName: e.target.value })} /></FormField>
            {err && <p className="err" role="alert">{err}</p>}
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}><button className="btn inline" type="submit">Save settings</button>{saved && <span role="status" style={{ fontSize: 13 }}>Saved</span>}</div>
          </div>
        </Card>
      </div>
    </form>
  );
}
