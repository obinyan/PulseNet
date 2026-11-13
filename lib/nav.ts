export const MAIN_NAV = [
  { label: "Overview", href: "/dashboard", icon: "overview" },
  { label: "Routers", href: "/dashboard/routers", icon: "routers" },
  { label: "Plans", href: "/dashboard/plans", icon: "plans" },
  { label: "Vouchers", href: "/dashboard/vouchers", icon: "vouchers" },
  { label: "Sessions", href: "/dashboard/sessions", icon: "sessions" },
];
export const MANAGE_NAV = [
  { label: "Customers", href: "/dashboard/customers", icon: "customers" },
  { label: "Payments", href: "/dashboard/payments", icon: "payments" },
  { label: "Agents", href: "/dashboard/agents", icon: "agents" },
  { label: "Reports", href: "/dashboard/reports", icon: "reports" },
];
export const SETTINGS_NAV = { label: "Settings", href: "/dashboard/settings", icon: "settings" };
export const SECTIONS = [...MAIN_NAV.slice(1), ...MANAGE_NAV, SETTINGS_NAV];
