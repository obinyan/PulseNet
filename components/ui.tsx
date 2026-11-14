"use client";
import { Icon } from "./icons";

export function PageHead({ title, sub, action }: { title: string; sub: string; action?: React.ReactNode }) {
  return (
    <div className="row page-head">
      <div><h1>{title}</h1><div className="muted" style={{ fontSize: 14, marginTop: 4 }}>{sub}</div></div>
      <div className="row">
        <button className="iconbtn desk-only" aria-label="Notifications"><Icon name="bell" /></button>
        {action}
      </div>
    </div>
  );
}
export function Chips<T extends string>({ items, value, onChange }: { items: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="chips" role="group">
      {items.map((i) => <button key={i} type="button" className={`chip ${i === value ? "on" : ""}`} aria-pressed={i === value} onClick={() => onChange(i)}>{i}</button>)}
    </div>
  );
}
export const Empty = ({ children }: { children: React.ReactNode }) => <p className="empty">{children}</p>;
export function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label style={{ display: "block" }}><span className="lb">{label}</span>{children}</label>;
}
