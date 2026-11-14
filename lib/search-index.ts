import { MAIN_NAV, MANAGE_NAV, SETTINGS_NAV } from "./nav";
import type { Batch, Plan, Router, Voucher } from "./store";

export type SearchEntry = { title: string; group: string; href: string; hint?: string };

const pages: SearchEntry[] = [...MAIN_NAV, ...MANAGE_NAV, SETTINGS_NAV].map((n) => ({ title: n.label, group: "Page", href: n.href, hint: "Go to page" }));
import { SETTINGS_SECTIONS } from "./settings-sections";
const settings: SearchEntry[] = SETTINGS_SECTIONS.map((x) => ({ title: x.label, group: "Settings", href: `${SETTINGS_NAV.href}?s=${x.slug}`, hint: "Settings" }));

export function buildIndex(d: { routers: Router[]; plans: Plan[]; vouchers: Voucher[]; batches: Batch[] }): SearchEntry[] {
  return [
    ...pages, ...settings,
    ...d.routers.map((r) => ({ title: r.name, group: "Router", href: "/dashboard/routers", hint: r.site || r.brand })),
    ...d.plans.map((p) => ({ title: p.name, group: "Plan", href: "/dashboard/plans", hint: "Plan" })),
    ...d.batches.map((b) => ({ title: b.name, group: "Batch", href: "/dashboard/vouchers", hint: `${b.qty} vouchers` })),
    ...d.vouchers.slice(0, 2000).map((v) => ({ title: v.code, group: "Voucher", href: "/dashboard/vouchers", hint: v.status })),
  ];
}

export function search(q: string, index: SearchEntry[]): SearchEntry[] {
  const t = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!t.length) return index.filter((e) => e.group === "Page");
  return index.map((e) => {
    const hay = `${e.title} ${e.group} ${e.hint ?? ""}`.toLowerCase();
    if (!t.every((w) => hay.includes(w))) return { e, s: 0 };
    return { e, s: 1 + (e.title.toLowerCase().startsWith(t[0]) ? 2 : 0) + (e.group === "Page" ? 1 : 0) };
  }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 12).map((x) => x.e);
}
