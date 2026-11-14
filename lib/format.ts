export const money = (n: number) => `₦${n.toLocaleString("en-NG")}`;
export const dur = (n: number, unit: "hours" | "days") => `${n} ${n === 1 ? unit.slice(0, -1) : unit}`;
export const when = (t: number | null) => (t ? new Date(t).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "Never");
export const day = (t: number) => new Date(t).toLocaleDateString("en-NG", { dateStyle: "medium" });
