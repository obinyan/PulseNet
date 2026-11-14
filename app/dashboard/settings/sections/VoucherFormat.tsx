"use client";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/Cards";
import { FormField } from "@/components/ui";
import { CHARSETS, makeCode, useStore, type Settings } from "@/lib/store";

type V = Settings["voucherFormat"];

export function VoucherFormat() {
  const { settings, updateSettings, ready } = useStore();
  const [d, setD] = useState<V>(settings.voucherFormat);
  const [t, setT] = useState({ length: "8", group: "4", expiry: "" });
  const [err, setErr] = useState(""); const [saved, setSaved] = useState(false); const [nonce, setNonce] = useState(0);
  useEffect(() => { if (ready) { const f = settings.voucherFormat; setD(f); setT({ length: String(f.length), group: String(f.group), expiry: f.expiryDays ? String(f.expiryDays) : "" }); } }, [ready, settings.voucherFormat]);
  const len = Number(t.length), grp = Number(t.group);
  const live: V = { ...d, length: len >= 4 && len <= 16 ? len : d.length, group: grp >= 0 && grp <= 16 ? grp : d.group };
  const sample = useMemo(() => makeCode(live, d.prefix.replace(/[^a-z0-9]/gi, "").slice(0, 4)), [live.length, live.group, live.charset, live.caseMode, live.separator, d.prefix, nonce]); // eslint-disable-line react-hooks/exhaustive-deps
  const space = CHARSETS[live.charset].length ** live.length;
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!(Number.isInteger(len) && len >= 4 && len <= 16)) return setErr("Code length must be a whole number from 4 to 16.");
    if (!(Number.isInteger(grp) && grp >= 0 && grp <= len)) return setErr("Group size must be 0 (no grouping) up to the code length.");
    const exp = t.expiry === "" ? null : Number(t.expiry);
    if (exp !== null && !(Number.isInteger(exp) && exp >= 1)) return setErr("Expiry must be a whole number of days, or empty for never.");
    const next: V = { ...d, length: len, group: grp, prefix: d.prefix.replace(/[^a-z0-9]/gi, "").slice(0, 4), expiryDays: exp };
    setErr(""); setD(next); updateSettings("voucherFormat", next); setSaved(true);
  };
  const up = (p: Partial<V>) => { setD({ ...d, ...p }); setSaved(false); };
  return (
    <form className="grid g21 stack" style={{ alignItems: "start" }} onSubmit={save}>
      <Card title="Code format">
        <div className="fcol">
          <div className="two">
            <FormField label="Code length (4 to 16)"><input className="fi" type="number" min="4" max="16" value={t.length} onChange={(e) => { setT({ ...t, length: e.target.value }); setSaved(false); }} /></FormField>
            <FormField label="Group size (0 for none)"><input className="fi" type="number" min="0" max="16" value={t.group} onChange={(e) => { setT({ ...t, group: e.target.value }); setSaved(false); }} /></FormField>
            <FormField label="Prefix (optional, up to 4)"><input className="fi" maxLength={4} value={d.prefix} onChange={(e) => up({ prefix: e.target.value.replace(/[^a-z0-9]/gi, "") })} /></FormField>
            <FormField label="Separator"><select className="fi" value={d.separator} onChange={(e) => up({ separator: e.target.value as V["separator"] })}><option value="dash">Dash</option><option value="none">None</option></select></FormField>
            <FormField label="Characters used"><select className="fi" value={d.charset} onChange={(e) => up({ charset: e.target.value as V["charset"] })}><option value="safe">Letters and numbers, no look-alikes</option><option value="numbers">Numbers only</option><option value="letters">Letters only, no look-alikes</option></select></FormField>
            <FormField label="Letter case"><select className="fi" value={d.caseMode} onChange={(e) => up({ caseMode: e.target.value as V["caseMode"] })}><option value="upper">Uppercase</option><option value="lower">Lowercase</option></select></FormField>
          </div>
          <h3 style={{ margin: "8px 0 0", font: "600 16px Inter,sans-serif" }}>Expiry and timing</h3>
          <div className="two">
            <FormField label="Unused vouchers expire after (days, empty for never)"><input className="fi" type="number" min="1" value={t.expiry} onChange={(e) => { setT({ ...t, expiry: e.target.value }); setSaved(false); }} /></FormField>
            <FormField label="Time starts counting from"><select className="fi" value={d.startFrom} onChange={(e) => up({ startFrom: e.target.value as V["startFrom"] })}><option value="first-login">First login</option><option value="generation">When generated</option></select></FormField>
          </div>
          {err && <p className="err" role="alert">{err}</p>}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}><button className="btn inline" type="submit">Save changes</button>{saved && <span role="status" style={{ fontSize: 13 }}>Saved</span>}</div>
          <p className="muted" style={{ fontSize: 12, margin: 0 }}>Applies to batches generated from now on. Existing vouchers keep their codes. The timing choice is used when the router connection is added.</p>
        </div>
      </Card>
      <Card title="Preview">
        <div style={{ textAlign: "center", padding: "18px 0" }}>
          <div style={{ font: "600 26px ui-monospace,Menlo,monospace", letterSpacing: ".06em", overflowWrap: "anywhere" }}>{sample}</div>
          <button type="button" className="linkbtn" onClick={() => setNonce(nonce + 1)}>New sample</button>
        </div>
        <div className="pline"><span className="muted">Characters in a code</span><span>{live.length}</span></div>
        <div className="pline"><span className="muted">Possible codes</span><span>{space >= 1e15 ? space.toExponential(1) : space.toLocaleString("en-NG")}</span></div>
        <div className="pline"><span className="muted">Look-alike characters</span><span>{live.charset === "numbers" ? "Not applicable" : "Excluded"}</span></div>
      </Card>
    </form>
  );
}
