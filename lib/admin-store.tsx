"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type Operator = { id: string; business: string; name: string; email: string; phone: string; status: "active" | "suspended"; createdAt: number };
export type SubPlan = { id: string; name: string; price: number; routers: number | null; customers: number | null; sms: number; active: boolean; createdAt: number };
type AData = { operators: Operator[]; plans: SubPlan[] };

const KEY = "pulsenet.admin.v1";
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const read = (): AData => { try { const j = JSON.parse(localStorage.getItem(KEY) || "{}"); return { operators: j.operators || [], plans: j.plans || [] }; } catch { return { operators: [], plans: [] }; } };

// Called from the sign-up form. Test build: stored in this browser only.
export function registerOperator(o: { business: string; name: string; email: string; phone: string }) {
  try { const d = read(); d.operators = [{ id: uid(), ...o, status: "active", createdAt: Date.now() }, ...d.operators]; localStorage.setItem(KEY, JSON.stringify(d)); } catch {}
}

type Ctx = AData & {
  ready: boolean;
  setStatus: (id: string, s: Operator["status"]) => void;
  removeOperator: (id: string) => void;
  addPlan: (p: Omit<SubPlan, "id" | "createdAt" | "active">) => void;
  updatePlan: (id: string, p: Omit<SubPlan, "id" | "createdAt" | "active">) => void;
  removePlan: (id: string) => void;
  togglePlan: (id: string) => void;
};
const C = createContext<Ctx | null>(null);
export const useAdmin = () => { const c = useContext(C); if (!c) throw new Error("useAdmin outside AdminProvider"); return c; };

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [d, setD] = useState<AData>({ operators: [], plans: [] });
  const [ready, setReady] = useState(false);
  useEffect(() => { setD(read()); setReady(true); }, []);
  useEffect(() => { if (ready) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {} } }, [d, ready]);
  const v: Ctx = {
    ...d, ready,
    setStatus: (id, s) => setD((x) => ({ ...x, operators: x.operators.map((o) => (o.id === id ? { ...o, status: s } : o)) })),
    removeOperator: (id) => setD((x) => ({ ...x, operators: x.operators.filter((o) => o.id !== id) })),
    addPlan: (p) => setD((x) => ({ ...x, plans: [{ ...p, id: uid(), active: true, createdAt: Date.now() }, ...x.plans] })),
    updatePlan: (id, p) => setD((x) => ({ ...x, plans: x.plans.map((y) => (y.id === id ? { ...y, ...p } : y)) })),
    removePlan: (id) => setD((x) => ({ ...x, plans: x.plans.filter((y) => y.id !== id) })),
    togglePlan: (id) => setD((x) => ({ ...x, plans: x.plans.map((y) => (y.id === id ? { ...y, active: !y.active } : y)) })),
  };
  return <C.Provider value={v}>{children}</C.Provider>;
}
