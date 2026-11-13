import { Sidebar } from "@/components/Sidebar";
import { SearchProvider } from "@/components/SearchProvider";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileNav } from "@/components/MobileNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SearchProvider>
      <div className="stage">
        <div className="orb" style={{ width: 520, height: 520, left: -120, bottom: -140, background: "#3b50c8" }} />
        <div className="orb" style={{ width: 420, height: 420, right: -60, top: -100, background: "#6a82ff", opacity: 0.8 }} />
        <div className="shell">
          <Sidebar />
          <div className="content">
            <MobileHeader />
            <main className="main">{children}</main>
          </div>
        </div>
        <MobileNav />
      </div>
    </SearchProvider>
  );
}
