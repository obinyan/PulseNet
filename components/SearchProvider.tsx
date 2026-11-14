"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { buildIndex, search } from "@/lib/search-index";
import { useStore } from "@/lib/store";
import { Icon } from "./icons";

const Ctx = createContext<{ open: () => void }>({ open: () => {} });
export const useSearch = () => useContext(Ctx);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const router = useRouter();
  const { routers, plans, vouchers, batches } = useStore();
  const index = useMemo(() => buildIndex({ routers, plans, vouchers, batches }), [routers, plans, vouchers, batches]);
  const results = useMemo(() => search(q, index), [q, index]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  useEffect(() => { if (!isOpen) { setQ(""); setI(0); } }, [isOpen]);

  const go = (href: string) => { setOpen(false); router.push(href); };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setI((x) => Math.min(x + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setI((x) => Math.max(x - 1, 0)); }
    else if (e.key === "Enter" && results[i]) go(results[i].href);
  };

  return (
    <Ctx.Provider value={{ open: () => setOpen(true) }}>
      {children}
      {isOpen && (
        <div className="sx-back" onClick={() => setOpen(false)}>
          <div className="glass sx" role="dialog" aria-modal="true" aria-label="Search PulseNet" onClick={(e) => e.stopPropagation()}>
            <div className="sx-in">
              <Icon name="search" />
              <input autoFocus value={q} onChange={(e) => { setQ(e.target.value); setI(0); }} onKeyDown={onKey} placeholder="Search pages, vouchers, settings, customers" aria-label="Search" />
            </div>
            <ul role="listbox" className="sx-list">
              {results.length === 0 ? <li className="sx-empty muted">No results for “{q}”</li> : results.map((r, n) => (
                <li key={r.group + r.title} role="option" aria-selected={n === i} className={n === i ? "on" : ""} onMouseEnter={() => setI(n)} onClick={() => go(r.href)}>
                  <div><b>{r.title}</b>{r.hint && <small>{r.hint}</small>}</div>
                  <span className="pill">{r.group}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
