"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "./icons";
import { MAIN_NAV, MANAGE_NAV, SETTINGS_NAV } from "@/lib/nav";
import { SignOutButton } from "./SignOutButton";

const TABS = [MAIN_NAV[0], MAIN_NAV[1], MAIN_NAV[3], MAIN_NAV[4]];
const MORE = [MAIN_NAV[2], ...MANAGE_NAV, SETTINGS_NAV];

export function MobileNav() {
  const path = usePathname();
  const [more, setMore] = useState(false);
  const on = (href: string) => (href === "/dashboard" ? path === href : path.startsWith(href));
  return (
    <>
      {more && (
        <>
          <div className="sheet-back" onClick={() => setMore(false)} />
          <div className="glass sheet">
            {MORE.map((n) => <Link key={n.href} href={n.href} onClick={() => setMore(false)} className={`tab ${on(n.href) ? "active" : ""}`}><Icon name={n.icon} />{n.label}</Link>)}
            <SignOutButton variant="mobile" onSignedOut={() => setMore(false)} />
          </div>
        </>
      )}
      <nav className="glass mnav" aria-label="Main">
        {TABS.map((n) => <Link key={n.href} href={n.href} className={`tab ${on(n.href) ? "active" : ""}`}><Icon name={n.icon} />{n.label}</Link>)}
        <button className={`tab ${more ? "active" : ""}`} onClick={() => setMore(!more)} aria-expanded={more}><Icon name="more" />More</button>
      </nav>
    </>
  );
}
