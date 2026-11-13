import { MAIN_NAV, MANAGE_NAV, SETTINGS_NAV } from "./nav";

export type SearchEntry = { title: string; group: string; href: string; hint?: string };

// Front-end test index. Pages and settings are real routes; records are sample data.
// When the backend exists, replace record entries with a server search (scoped to the operator).
const pages: SearchEntry[] = [...MAIN_NAV, ...MANAGE_NAV, SETTINGS_NAV].map((n) => ({ title: n.label, group: "Page", href: n.href, hint: "Go to page" }));
const settings: SearchEntry[] = ["Business profile", "Branding and logo", "Staff and roles", "Notifications", "Billing and subscription", "Password and security", "Payment gateway", "Router defaults", "Voucher code format", "Data export"].map((t) => ({ title: t, group: "Settings", href: SETTINGS_NAV.href, hint: "Settings" }));
const records: SearchEntry[] = [
  ...["K7P4-XM2R", "H3WQ-9TNA", "P8DC-5ZLE"].map((c) => ({ title: c, group: "Voucher", href: "/dashboard/vouchers", hint: "Voucher code" })),
  ...["Router 1", "Router 2", "Router 3"].map((r) => ({ title: r, group: "Router", href: "/dashboard/routers", hint: "Router" })),
  ...["1 Hour", "1 Day", "1 Week"].map((p) => ({ title: `${p} plan`, group: "Plan", href: "/dashboard/plans", hint: "Plan" })),
  { title: "[Customer name]", group: "Customer", href: "/dashboard/customers", hint: "Customer" },
  { title: "[Agent name]", group: "Agent", href: "/dashboard/agents", hint: "Agent" },
  { title: "Recent sessions", group: "Session", href: "/dashboard/sessions", hint: "Sessions" },
  { title: "Transactions and receipts", group: "Payment", href: "/dashboard/payments", hint: "Payments" },
  { title: "Revenue reports", group: "Report", href: "/dashboard/reports", hint: "Reports" },
];
const INDEX = [...pages, ...settings, ...records];

export function search(q: string): SearchEntry[] {
  const t = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!t.length) return pages;
  return INDEX.map((e) => {
    const hay = `${e.title} ${e.group} ${e.hint ?? ""}`.toLowerCase();
    if (!t.every((w) => hay.includes(w))) return { e, s: 0 };
    return { e, s: 1 + (e.title.toLowerCase().startsWith(t[0]) ? 2 : 0) + (e.group === "Page" ? 1 : 0) };
  }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 12).map((x) => x.e);
}
