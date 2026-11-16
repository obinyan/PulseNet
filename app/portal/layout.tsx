import { StoreProvider } from "@/lib/store";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <StoreProvider>{children}</StoreProvider>;
}
