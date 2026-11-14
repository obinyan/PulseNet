import Link from "next/link";

export function Card({ title, href, children, className = "" }: { title: string; href?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`glass ${className}`}>
      <div className="row" style={{ marginBottom: 10 }}>
        <span className="ct">{title}</span>
        {href && <Link href={href} className="viewall">View all</Link>}
      </div>
      {children}
    </section>
  );
}
export function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="glass stat"><div className="muted" style={{ fontSize: 13 }}>{label}</div><div className="v">{value}</div><small className="muted">{note}</small></div>
  );
}
export function Item({ title, sub, tag }: { title: string; sub: string; tag: string }) {
  return (
    <div className="item"><div><b>{title}</b><small>{sub}</small></div><span className="pill">{tag}</span></div>
  );
}
