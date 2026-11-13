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
export function BarChart({ data }: { data: { day: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <svg viewBox="0 0 400 180" width="100%" height="200" role="img" aria-label="Revenue per day, last 7 days">
      <defs><linearGradient id="bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".9" /><stop offset="1" stopColor="#8ea0ff" stopOpacity=".55" /></linearGradient></defs>
      {data.map((d, i) => {
        const h = Math.max(4, (d.value / max) * 130);
        return (<g key={d.day}><rect x={18 + i * 54} y={150 - h} width="30" height={h} rx="7" fill="url(#bar)" /><text x={33 + i * 54} y="172" fill="#d3d9ff" fontSize="12" textAnchor="middle">{d.day}</text></g>);
      })}
    </svg>
  );
}
