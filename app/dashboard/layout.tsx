import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="stage">
      <div className="orb" style={{ width: 520, height: 520, left: -120, bottom: -140, background: "#3b50c8" }} />
      <div className="orb" style={{ width: 420, height: 420, right: -60, top: -100, background: "#6a82ff", opacity: 0.8 }} />
      <div className="shell">
        <Sidebar />
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
