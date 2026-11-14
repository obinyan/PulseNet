export type Period = "Today" | "7 days" | "30 days";
export type Bucket = { label: string; start: number; end: number };
const DAY = 86400000;

// Client-only (uses the browser clock and time zone).
export function buckets(period: Period): Bucket[] {
  const d0 = new Date(); d0.setHours(0, 0, 0, 0);
  const today = d0.getTime();
  if (period === "Today") {
    return Array.from({ length: 24 }, (_, h) => ({ label: `${h % 12 || 12}${h < 12 ? "am" : "pm"}`, start: today + h * 3600000, end: today + (h + 1) * 3600000 }));
  }
  const n = period === "7 days" ? 7 : 30;
  return Array.from({ length: n }, (_, i) => {
    const start = today - (n - 1 - i) * DAY;
    const dt = new Date(start);
    const label = n === 7 ? dt.toLocaleDateString("en-NG", { weekday: "short", day: "numeric" }) : dt.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
    return { label, start, end: start + DAY };
  });
}
