"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, PulseIcon } from "./icons";
import { MAIN_NAV, MANAGE_NAV, SETTINGS_NAV } from "@/lib/nav";
import { useSearch } from "./SearchProvider";

type Item = { label: string; href: string; icon: string };

export function Sidebar() {
  const path = usePathname();
  const { open } = useSearch();
  const link = (n: Item) => {
    const active = n.href === "/dashboard" ? path === n.href : path.startsWith(n.href);
    return <Link key={n.href} href={n.href} className={`nav ${active ? "active" : ""}`}><Icon name={n.icon} />{n.label}</Link>;
  };
  return (
    <aside className="glass side">
      <Link href="/dashboard" className="brand"><PulseIcon size={34} /><span className="wm">PulseNet</span></Link>
      <button className="nav searchbtn" onClick={open}><Icon name="search" />Search</button>
      {MAIN_NAV.map(link)}
      <div className="navlabel">MANAGE</div>
      {MANAGE_NAV.map(link)}
      <div style={{ flex: 1 }} />
      {link(SETTINGS_NAV)}
    </aside>
  );
}
