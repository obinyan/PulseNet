"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type Operator = { id: string; business: string; name: string; email: string; phone: string; status: "active" | "suspended"; createdAt: number };
export type SubPlan = { id: string; name: string; price: number; routers: number | null; customers: number | null; sms: number; active: boolean; createdAt: number };
type AData = { operators: Operator[]; plans: SubPlan[] };

const KEY = "pulsenet.admin.v1";
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const read = (): AData => { try { const j = JSON.parse(localStorage.getItem(KEY) || "{}"); return { operators: [], plans: j.plans || [] }; } catch { return { operators: [], plans: [] }; } };

type Ctx = AData & {
  ready: boolean;
  operatorError: string;
  setStatus: (id: string, s: Operator["status"]) => Promise<void>;
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
  const [operatorError, setOperatorError] = useState("");
  useEffect(() => {
    const saved = read();
    setD((x) => ({ ...x, plans: saved.plans }));
    let cancelled = false;
    fetch("/api/admin/operators")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not load operators.");
        if (!cancelled) setD((x) => ({ ...x, operators: result.operators || [] }));
      })
      .catch((error) => { if (!cancelled) setOperatorError(error instanceof Error ? error.message : "Could not load operators."); })
      .finally(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => { if (ready) { try { localStorage.setItem(KEY, JSON.stringify({ plans: d.plans })); } catch {} } }, [d.plans, ready]);
  const v: Ctx = {
    ...d, ready, operatorError,
    setStatus: async (id, status) => {
      setOperatorError("");
      try {
        const response = await fetch(`/api/admin/operators/${id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not update operator status.");
        setD((x) => ({ ...x, operators: x.operators.map((o) => o.id === id ? { ...o, status } : o) }));
      } catch (error) {
        setOperatorError(error instanceof Error ? error.message : "Could not update operator status.");
      }
    },
    addPlan: (p) => setD((x) => ({ ...x, plans: [{ ...p, id: uid(), active: true, createdAt: Date.now() }, ...x.plans] })),
    updatePlan: (id, p) => setD((x) => ({ ...x, plans: x.plans.map((y) => (y.id === id ? { ...y, ...p } : y)) })),
    removePlan: (id) => setD((x) => ({ ...x, plans: x.plans.filter((y) => y.id !== id) })),
    togglePlan: (id) => setD((x) => ({ ...x, plans: x.plans.map((y) => (y.id === id ? { ...y, active: !y.active } : y)) })),
  };
  return <C.Provider value={v}>{children}</C.Provider>;
}
