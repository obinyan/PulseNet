"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type Router = { id: string; name: string; site: string; brand: string; secret: string; status: "online" | "offline"; users: number; lastSeen: number | null; createdAt: number };
export type Plan = { id: string; name: string; price: number; duration: number; unit: "hours" | "days"; speed: number; dataGb: number | null; devices: number; active: boolean; createdAt: number };
export type VStatus = "unused" | "active" | "used" | "expired" | "disabled";
export type Voucher = { code: string; planId: string; batchId: string; status: VStatus; createdAt: number; expiresAt?: number | null };
export type Batch = { id: string; name: string; planId: string; qty: number; createdAt: number };
export type Session = { id: string; voucher: string; device: string; ip: string; router: string; plan: string; duration: string; down: string; up: string };
export type Customer = { id: string; name: string; phone: string; device: string; lastVoucher: string; spent: number; dataMb: number; firstSeen: number; lastSeen: number | null; status: "online" | "offline" | "blocked" };
export type Payment = { id: string; reference: string; customer: string; plan: string; amount: number; method: "Card" | "Transfer"; status: "successful" | "pending" | "failed"; createdAt: number };
export type Agent = { id: string; name: string; phone: string; email: string; area: string; rate: number; batchId: string | null; active: boolean; createdAt: number };
export type Member = { id: string; name: string; email: string; role: "owner" | "staff" | "agent"; status: "active" | "invited"; createdAt: number };
export type Profile = { name: string; email: string; phone: string; country: string; currency: string; timezone: string; address: string };
export const NOTIFY_EVENTS = [["router_offline", "Router goes offline"], ["router_online", "Router back online"], ["low_stock", "Low voucher stock"], ["payment_ok", "Payment received"], ["payment_fail", "Payment failed"], ["commission", "Agent commission due"], ["daily", "Daily summary"]] as const;
export type Settings = {
  branding: { logo: string | null; favicon: string | null; businessName: string; primary: string; accent: string; title: string; message: string; button: string; support: string };
  notifications: { events: Record<string, { email: boolean; sms: boolean; app: boolean }>; recipients: { id: string; type: "email" | "sms"; value: string }[] };
  gateway: { provider: "paystack" | "flutterwave"; live: boolean; publicKey: string; card: boolean; transfer: boolean; ussd: boolean; customerPaysFee: boolean; bank: string; accountNumber: string; accountName: string };
  routerDefaults: { accountingMinutes: number; idleMinutes: number; devices: number; dns1: string; dns2: string; rememberDevices: boolean; freeSites: string[] };
  voucherFormat: { length: number; group: number; prefix: string; separator: "dash" | "none"; charset: "safe" | "numbers" | "letters"; caseMode: "upper" | "lower"; expiryDays: number | null; startFrom: "first-login" | "generation" };
  exports: { id: string; at: number; data: string; format: "CSV" | "JSON"; from: string; to: string; rows: number }[];
};
export const DEFAULT_SETTINGS: Settings = {
  branding: { logo: null, favicon: null, businessName: "", primary: "#3b50c8", accent: "#8ea0ff", title: "", message: "", button: "Connect", support: "" },
  notifications: { events: Object.fromEntries(NOTIFY_EVENTS.map(([k]) => [k, { email: ["router_offline", "low_stock", "payment_ok", "payment_fail", "commission", "daily"].includes(k), sms: ["router_offline", "payment_fail"].includes(k), app: !["commission", "daily"].includes(k) }])), recipients: [] },
  gateway: { provider: "paystack", live: false, publicKey: "", card: true, transfer: true, ussd: false, customerPaysFee: false, bank: "", accountNumber: "", accountName: "" },
  routerDefaults: { accountingMinutes: 5, idleMinutes: 10, devices: 1, dns1: "8.8.8.8", dns2: "1.1.1.1", rememberDevices: false, freeSites: [] },
  voucherFormat: { length: 8, group: 4, prefix: "", separator: "dash", charset: "safe", caseMode: "upper", expiryDays: null, startFrom: "first-login" },
  exports: [],
};
export type PlanInput = Omit<Plan, "id" | "createdAt" | "active">;

export const RADIUS_HOST = process.env.NEXT_PUBLIC_RADIUS_HOST || "YOUR_SERVER_IP";
const KEY = "pulsenet.v1";
const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
function rand(len: number, set: string) {
  const a = new Uint32Array(len);
  crypto.getRandomValues(a);
  return Array.from(a, (n) => set[n % set.length]).join("");
}
export const CHARSETS = { safe: ALPHA, numbers: "0123456789", letters: "ABCDEFGHJKLMNPQRSTUVWXYZ" };
export function makeCode(f: Settings["voucherFormat"], prefix: string) {
  const sep = f.separator === "dash" ? "-" : "";
  const raw = rand(f.length, CHARSETS[f.charset]);
  const body = f.group > 0 && f.group < f.length ? (raw.match(new RegExp(`.{1,${f.group}}`, "g")) || [raw]).join(sep) : raw;
  const code = `${prefix ? prefix.toUpperCase() + sep : ""}${body}`;
  return f.caseMode === "lower" ? code.toLowerCase() : code;
}
export const effStatus = (v: Voucher): VStatus => (v.status === "unused" && v.expiresAt && v.expiresAt < Date.now() ? "expired" : v.status);
export function routerScript(r: Router, d: Settings["routerDefaults"]) {
  const lines = [
    `# PulseNet setup for ${r.name}`,
    `/radius add service=hotspot address=${RADIUS_HOST} secret=${r.secret}`,
    `/ip hotspot profile set [find] use-radius=yes radius-interim-update=${d.accountingMinutes}m login-by=${d.rememberDevices ? "mac,http-chap" : "http-chap"}`,
    `/ip hotspot user profile set [find] idle-timeout=${d.idleMinutes}m shared-users=${d.devices}`,
    `/ip dns set servers=${[d.dns1, d.dns2].filter(Boolean).join(",")}`,
    ...d.freeSites.map((x) => `/ip hotspot walled-garden add dst-host=${x}`),
  ];
  return lines.join("\n");
}

type Data = { routers: Router[]; plans: Plan[]; vouchers: Voucher[]; batches: Batch[]; agents: Agent[]; team: Member[]; profile: Profile; settings: Settings };
const EMPTY: Data = { routers: [], plans: [], vouchers: [], batches: [], agents: [], team: [], profile: { name: "", email: "", phone: "", country: "Nigeria", currency: "NGN", timezone: "Africa/Lagos", address: "" }, settings: DEFAULT_SETTINGS };
type Ctx = Data & {
  ready: boolean;
  sessions: Session[];
  customers: Customer[];
  payments: Payment[];
  addAgent: (a: Omit<Agent, "id" | "createdAt" | "active">) => void;
  removeAgent: (id: string) => void;
  toggleAgent: (id: string) => void;
  inviteMember: (m: { name: string; email: string; role: Member["role"] }) => void;
  removeMember: (id: string) => void;
  saveProfile: (p: Profile) => void;
  updateSettings: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
  resetAll: () => void;
  addRouter: (i: { name: string; site: string; brand: string }) => Router;
  removeRouter: (id: string) => void;
  addPlan: (p: PlanInput) => void;
  updatePlan: (id: string, p: PlanInput) => void;
  removePlan: (id: string) => void;
  duplicatePlan: (id: string) => void;
  togglePlan: (id: string) => void;
  generate: (i: { planId: string; qty: number; prefix: string; name: string }) => Batch;
  setVoucherStatus: (code: string, s: VStatus) => void;
};
const C = createContext<Ctx | null>(null);
export const useStore = () => {
  const c = useContext(C);
  if (!c) throw new Error("useStore outside StoreProvider");
  return c;
};

// Front-end test store (browser localStorage). Replace with API calls when the backend exists.
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Data>(EMPTY);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) { const j = JSON.parse(raw); setData({ ...EMPTY, ...j, profile: { ...EMPTY.profile, ...(j.profile || {}) }, settings: Object.fromEntries(Object.keys(DEFAULT_SETTINGS).map((k) => { const key = k as keyof Settings; const dv = DEFAULT_SETTINGS[key]; const sv = (j.settings || {})[key]; return [k, Array.isArray(dv) ? sv ?? dv : { ...dv, ...(sv || {}) }]; })) as Settings }); } } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {} } }, [data, ready]);

  const addRouter: Ctx["addRouter"] = (i) => {
    const r: Router = { id: uid(), name: i.name, site: i.site, brand: i.brand, secret: rand(20, ALPHA.toLowerCase() + "23456789"), status: "offline", users: 0, lastSeen: null, createdAt: Date.now() };
    setData((d) => ({ ...d, routers: [r, ...d.routers] }));
    return r;
  };
  const generate: Ctx["generate"] = ({ planId, qty, prefix, name }) => {
    const f = data.settings.voucherFormat;
    const pre = (prefix || f.prefix).replace(/[^a-z0-9]/gi, "").slice(0, 4);
    const taken = new Set(data.vouchers.map((v) => v.code));
    const now = Date.now();
    const batch: Batch = { id: uid(), name: name.trim() || `Batch ${data.batches.length + 1}`, planId, qty, createdAt: now };
    const list: Voucher[] = [];
    let tries = 0;
    while (list.length < qty && tries++ < qty * 50 + 200) {
      const code = makeCode(f, pre);
      if (taken.has(code)) continue;
      taken.add(code);
      list.push({ code, planId, batchId: batch.id, status: "unused", createdAt: now, expiresAt: f.expiryDays ? now + f.expiryDays * 86400000 : null });
    }
    batch.qty = list.length;
    setData((d) => ({ ...d, batches: [batch, ...d.batches], vouchers: [...list, ...d.vouchers] }));
    return batch;
  };
  const value: Ctx = {
    ...data, ready, sessions: [], customers: [], payments: [],
    addAgent: (a) => setData((d) => ({ ...d, agents: [{ ...a, id: uid(), active: true, createdAt: Date.now() }, ...d.agents] })),
    removeAgent: (id) => setData((d) => ({ ...d, agents: d.agents.filter((x) => x.id !== id) })),
    toggleAgent: (id) => setData((d) => ({ ...d, agents: d.agents.map((x) => (x.id === id ? { ...x, active: !x.active } : x)) })),
    inviteMember: (m) => setData((d) => ({ ...d, team: [{ ...m, id: uid(), status: "invited", createdAt: Date.now() }, ...d.team] })),
    removeMember: (id) => setData((d) => ({ ...d, team: d.team.filter((x) => x.id !== id) })),
    saveProfile: (p) => setData((d) => ({ ...d, profile: p })),
    updateSettings: (k, v) => setData((d) => ({ ...d, settings: { ...d.settings, [k]: v } })),
    resetAll: () => setData(EMPTY),
    addRouter, generate,
    removeRouter: (id) => setData((d) => ({ ...d, routers: d.routers.filter((r) => r.id !== id) })),
    addPlan: (p) => setData((d) => ({ ...d, plans: [{ ...p, id: uid(), active: true, createdAt: Date.now() }, ...d.plans] })),
    updatePlan: (id, p) => setData((d) => ({ ...d, plans: d.plans.map((x) => (x.id === id ? { ...x, ...p } : x)) })),
    removePlan: (id) => setData((d) => ({ ...d, plans: d.plans.filter((x) => x.id !== id) })),
    duplicatePlan: (id) => setData((d) => { const p = d.plans.find((x) => x.id === id); return p ? { ...d, plans: [{ ...p, id: uid(), name: `${p.name} copy`, createdAt: Date.now() }, ...d.plans] } : d; }),
    togglePlan: (id) => setData((d) => ({ ...d, plans: d.plans.map((x) => (x.id === id ? { ...x, active: !x.active } : x)) })),
    setVoucherStatus: (code, s) => setData((d) => ({ ...d, vouchers: d.vouchers.map((v) => (v.code === code ? { ...v, status: s } : v)) })),
  };
  return <C.Provider value={value}>{children}</C.Provider>;
}
