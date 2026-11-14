"use client";
import { useEffect, useRef, useState } from "react";

type Datum = { label: string; value: number };
const niceMax = (v: number) => { if (v <= 0) return 1000; const p = 10 ** Math.floor(Math.log10(v)); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; };
export const compact = (n: number) => (n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${+(n / 1e3).toFixed(1)}k` : String(n));

export function BarChart({ data, format, tick = compact, height = 260, emptyText = "No data yet", label }: { data: Datum[]; format: (n: number) => string; tick?: (n: number) => string; height?: number; emptyText?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(600);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const set = () => setW(el.clientWidth || 600);
    set();
    const ro = new ResizeObserver(set); ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const total = data.reduce((a, d) => a + d.value, 0);
  const max = niceMax(Math.max(0, ...data.map((d) => d.value)));
  const L = 52, R = 8, T = 20, B = 30;
  const iw = Math.max(w - L - R, 40), ih = height - T - B;
  const band = iw / Math.max(data.length, 1);
  const bw = Math.max(3, Math.min(44, band * 0.6));
  const step = Math.max(1, Math.ceil(data.length / Math.max(1, Math.floor(iw / 56))));
  const y = (v: number) => T + ih - (ih * v) / max;

  return (
    <div ref={ref} style={{ width: "100%" }}>
      <svg width={w} height={height} style={{ display: "block", maxWidth: "100%" }} role="img" aria-label={`${label}. ${total === 0 ? emptyText : `Total ${format(total)}`}`} onMouseLeave={() => setHover(null)}>
        {[0, 1, 2, 3, 4].map((i) => {
          const v = (max * i) / 4;
          return (<g key={i}><line x1={L} x2={w - R} y1={y(v)} y2={y(v)} stroke="rgba(255,255,255,.16)" strokeDasharray={i ? "3 4" : undefined} /><text x={L - 8} y={y(v) + 4} textAnchor="end" fill="#d3d9ff" fontSize="11">{tick(v)}</text></g>);
        })}
        {data.map((d, i) => {
          const h = (ih * d.value) / max;
          const x = L + band * i + (band - bw) / 2;
          return (
            <g key={i} onMouseEnter={() => setHover(i)} onClick={() => setHover(hover === i ? null : i)}>
              <rect x={L + band * i} y={T} width={band} height={ih} fill="transparent" />
              {d.value > 0 && <rect x={x} y={T + ih - h} width={bw} height={h} rx={Math.min(5, bw / 2)} fill={hover === i ? "#fff" : "rgba(255,255,255,.78)"} />}
              {d.value > 0 && band >= 38 && <text x={x + bw / 2} y={T + ih - h - 6} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="600">{tick(d.value)}</text>}
              {i % step === 0 && <text x={L + band * i + band / 2} y={height - 8} textAnchor="middle" fill="#d3d9ff" fontSize="11">{d.label}</text>}
              <title>{`${d.label}: ${format(d.value)}`}</title>
            </g>
          );
        })}
        {hover !== null && (() => {
          const d = data[hover]; const t = `${d.label}: ${format(d.value)}`;
          const tw = t.length * 6.6 + 16; const cx = L + band * hover + band / 2;
          const tx = Math.min(Math.max(cx - tw / 2, L), w - R - tw); const ty = Math.max(y(d.value) - 34, 2);
          return (<g pointerEvents="none"><rect x={tx} y={ty} width={tw} height={24} rx={8} fill="#000f6b" stroke="rgba(255,255,255,.4)" /><text x={tx + tw / 2} y={ty + 16} textAnchor="middle" fill="#fff" fontSize="12">{t}</text></g>);
        })()}
        {total === 0 && <text x={L + iw / 2} y={T + ih / 2} textAnchor="middle" fill="#d3d9ff" fontSize="14">{emptyText}</text>}
      </svg>
    </div>
  );
}
