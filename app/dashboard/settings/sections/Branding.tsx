"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/Cards";
import { FormField } from "@/components/ui";
import { useStore, type Settings } from "@/lib/store";

type B = Settings["branding"];
const HEX = /^#[0-9a-f]{6}$/i;

function Drop({ label, hint, value, onPick, onClear }: { label: string; hint: string; value: string | null; onPick: (f: File) => void; onClear: () => void }) {
  return (
    <div>
      <span className="lb">{label}</span>
      <label className="drop" style={{ position: "relative" }}>
        <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); e.target.value = ""; }} />
        {value ? <img src={value} alt={`${label} preview`} /> : <><b>Upload {label.toLowerCase()}</b><span className="muted" style={{ fontSize: 12 }}>{hint}</span></>}
      </label>
      {value && <button type="button" className="linkbtn" onClick={onClear}>Remove</button>}
    </div>
  );
}
function Colour({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <span className="lb">{label}</span>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <input type="color" aria-label={`${label} picker`} value={HEX.test(value) ? value : "#000000"} onChange={(e) => onChange(e.target.value)} style={{ width: 46, height: 46, border: 0, background: "none", padding: 0 }} />
        <input className="fi" style={{ maxWidth: 150 }} value={value} onChange={(e) => onChange(e.target.value)} aria-label={`${label} hex code`} />
      </div>
    </div>
  );
}

export function Branding() {
  const { settings, updateSettings, ready } = useStore();
  const [d, setD] = useState<B>(settings.branding);
  const [err, setErr] = useState(""); const [saved, setSaved] = useState(false);
  useEffect(() => { if (ready) setD(settings.branding); }, [ready, settings.branding]);
  const set = (k: keyof B) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setD({ ...d, [k]: e.target.value }); setSaved(false); };
  const pick = (k: "logo" | "favicon") => (f: File) => {
    if (!/^image\/(png|jpeg|svg\+xml|webp)$/.test(f.type)) return setErr("Use a PNG, JPG, SVG or WebP image.");
    if (f.size > 512 * 1024) return setErr("Image must be under 512 KB.");
    setErr(""); const r = new FileReader(); r.onload = () => { setD((x) => ({ ...x, [k]: String(r.result) })); setSaved(false); }; r.readAsDataURL(f);
  };
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!HEX.test(d.primary) || !HEX.test(d.accent)) return setErr("Colours must be hex codes like #3b50c8.");
    setErr(""); updateSettings("branding", d); setSaved(true);
  };
  const p = HEX.test(d.primary) ? d.primary : "#3b50c8", a = HEX.test(d.accent) ? d.accent : "#8ea0ff";
  return (
    <div className="grid g21 stack" style={{ alignItems: "start" }}>
      <form className="fcol" style={{ gap: 16 }} onSubmit={save}>
        <Card title="Logo and name">
          <div className="fcol">
            <div className="two"><Drop label="Logo" hint="PNG, JPG, SVG or WebP, under 512 KB" value={d.logo} onPick={pick("logo")} onClear={() => setD({ ...d, logo: null })} /><Drop label="Favicon" hint="Square image" value={d.favicon} onPick={pick("favicon")} onClear={() => setD({ ...d, favicon: null })} /></div>
            <FormField label="Business name shown to customers"><input className="fi" value={d.businessName} onChange={set("businessName")} /></FormField>
            <div className="two"><Colour label="Primary colour" value={d.primary} onChange={(v) => { setD({ ...d, primary: v }); setSaved(false); }} /><Colour label="Accent colour" value={d.accent} onChange={(v) => { setD({ ...d, accent: v }); setSaved(false); }} /></div>
          </div>
        </Card>
        <Card title="Customer login page">
          <div className="fcol">
            <FormField label="Page title"><input className="fi" value={d.title} onChange={set("title")} /></FormField>
            <FormField label="Welcome message"><textarea className="fi" style={{ height: 84, padding: 12, resize: "none" }} value={d.message} onChange={set("message")} /></FormField>
            <FormField label="Button text"><input className="fi" value={d.button} onChange={set("button")} /></FormField>
            <FormField label="Support phone or WhatsApp (optional)"><input className="fi" value={d.support} onChange={set("support")} /></FormField>
            {err && <p className="err" role="alert">{err}</p>}
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}><button className="btn inline" type="submit">Save changes</button>{saved && <span role="status" style={{ fontSize: 13 }}>Saved</span>}</div>
          </div>
        </Card>
      </form>
      <Card title="Live preview">
        <p style={{ margin: "0 0 12px" }}><a className="linkbtn" href="/portal/preview" target="_blank" rel="noreferrer">Open the customer login page</a></p>
        <div className="cpreview" style={{ background: `linear-gradient(160deg, color-mix(in srgb, ${p} 40%, black), ${p})` }}>
          {d.logo ? <img src={d.logo} alt="" style={{ maxWidth: 80, maxHeight: 56, objectFit: "contain" }} /> : <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>Logo</div>}
          <b>{d.title || d.businessName || "Your page title"}</b>
          <span className="muted" style={{ fontSize: 12 }}>{d.message || "Your welcome message"}</span>
          <div className="fi" style={{ display: "flex", alignItems: "center", fontSize: 13, width: "100%" }}>Enter voucher code</div>
          <div style={{ width: "100%", height: 44, borderRadius: 12, background: a, color: "#000f6b", display: "flex", alignItems: "center", justifyContent: "center", font: "600 14px Inter,sans-serif" }}>{d.button || "Connect"}</div>
          <span className="muted" style={{ fontSize: 12, textDecoration: "underline" }}>Buy a plan</span>
          {d.support && <span className="muted" style={{ fontSize: 12 }}>{d.support}</span>}
        </div>
      </Card>
    </div>
  );
}
