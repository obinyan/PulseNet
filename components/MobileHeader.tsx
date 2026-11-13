"use client";
import Link from "next/link";
import { Icon, PulseIcon } from "./icons";
import { useSearch } from "./SearchProvider";

export function MobileHeader() {
  const { open } = useSearch();
  return (
    <header className="mhead">
      <Link href="/dashboard" className="brand" style={{ margin: 0 }}><PulseIcon size={34} /><span className="wm">PulseNet</span></Link>
      <div className="row" style={{ gap: 10 }}>
        <button className="iconbtn" aria-label="Search" onClick={open}><Icon name="search" /></button>
        <button className="iconbtn" aria-label="Notifications"><Icon name="bell" /></button>
      </div>
    </header>
  );
}
