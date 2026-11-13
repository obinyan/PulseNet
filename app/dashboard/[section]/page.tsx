import { notFound } from "next/navigation";
import { SECTIONS } from "@/lib/nav";

export function generateStaticParams() {
  return SECTIONS.map((s) => ({ section: s.href.split("/").pop()! }));
}

export default function SectionPage({ params }: { params: { section: string } }) {
  const s = SECTIONS.find((x) => x.href.endsWith(`/${params.section}`));
  if (!s) notFound();
  return (
    <>
      <h1>{s.label}</h1>
      <div className="glass"><p className="muted" style={{ margin: 0 }}>The {s.label} page will be built here.</p></div>
    </>
  );
}
