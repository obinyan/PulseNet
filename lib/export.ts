export function downloadCsv(name: string, rows: string[][]) {
  const body = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([body], { type: "text/csv" }));
  a.download = name; a.click(); URL.revokeObjectURL(a.href);
}
export function downloadJson(name: string, data: unknown) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  a.download = name; a.click(); URL.revokeObjectURL(a.href);
}
export const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
