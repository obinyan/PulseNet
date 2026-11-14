"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type Router = { id: string; name: string; site: string; brand: string; secret: string; status: "online" | "offline"; users: number; lastSeen: number | null; createdAt: number };
export type Plan = { id: string; name: string; price: number; duration: number; unit: "hours" | "days"; speed: number; dataGb: number | null; devices: number; active: boolean; createdAt: number };
export type VStatus = "unused" | "active" | "used" | "expired" | "disabled";
export type Voucher = { code: string; planId: string; batchId: string; status: VStatus; createdAt: number };
export type Batch = { id: string; name: string; planId: string; qty: number; createdAt: number };
export type Session = { id: string; voucher: string; device: string; ip: string; router: string; plan: string; duration: string; down: string; up: string };
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
export const routerScript = (r: Router) =>
  `# PulseNet setup for ${r.name}\n/radius add service=hotspot address=${RADIUS_HOST} secret=${r.secret}\n/ip hotspot profile set [find] use-radius=yes`;

type Data = { routers: Router[]; plans: Plan[]; vouchers: Voucher[]; batches: Batch[] };
const EMPTY: Data = { routers: [], plans: [], vouchers: [], batches: [] };
type Ctx = Data & {
  ready: boolean;
  sessions: Session[];
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
    try { const raw = localStorage.getItem(KEY); if (raw) setData({ ...EMPTY, ...JSON.parse(raw) }); } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {} } }, [data, ready]);

  const addRouter: Ctx["addRouter"] = (i) => {
    const r: Router = { id: uid(), name: i.name, site: i.site, brand: i.brand, secret: rand(20, ALPHA.toLowerCase() + "23456789"), status: "offline", users: 0, lastSeen: null, createdAt: Date.now() };
    setData((d) => ({ ...d, routers: [r, ...d.routers] }));
    return r;
  };
  const generate: Ctx["generate"] = ({ planId, qty, prefix, name }) => {
    const taken = new Set(data.vouchers.map((v) => v.code));
    const now = Date.now();
    const batch: Batch = { id: uid(), name: name.trim() || `Batch ${data.batches.length + 1}`, planId, qty, createdAt: now };
    const list: Voucher[] = [];
    while (list.length < qty) {
      const s = rand(8, ALPHA);
      const code = `${prefix ? prefix.toUpperCase() + "-" : ""}${s.slice(0, 4)}-${s.slice(4)}`;
      if (taken.has(code)) continue;
      taken.add(code);
      list.push({ code, planId, batchId: batch.id, status: "unused", createdAt: now });
    }
    setData((d) => ({ ...d, batches: [batch, ...d.batches], vouchers: [...list, ...d.vouchers] }));
    return batch;
  };
  const value: Ctx = {
    ...data, ready, sessions: [],
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
