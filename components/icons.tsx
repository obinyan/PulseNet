const P: Record<string, React.ReactNode> = {
  overview: <path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  routers: (<><rect x="3" y="13" width="18" height="7" rx="2" /><path d="M12 13V9M8.5 6.5a5 5 0 0 1 7 0" /></>),
  plans: <path d="M3 12l9-9h8v8l-9 9z" />,
  vouchers: (<><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M9 6v12" /></>),
  sessions: <path d="M3 12h4l3-8 4 16 3-8h4" />,
  customers: (<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>),
  payments: (<><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></>),
  agents: (<><circle cx="9" cy="8" r="3" /><path d="M3 21a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 15a6 6 0 0 1 3 6" /></>),
  reports: <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />,
  settings: (<><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></>),
  search: (<><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>),
  more: (<><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></>),
  bell: <path d="M6 9a6 6 0 0 1 12 0c0 6 3 7 3 7H3s3-1 3-7M10 20a2 2 0 0 0 4 0" />,
  eye: (<><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>),
};
export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[name]}
    </svg>
  );
}
export function PulseIcon({ size = 190 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round((size * 165) / 190)} viewBox="0 0 190 165" fill="none" stroke="#fff" strokeWidth={size > 100 ? 14 : 16} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={size > 100 ? { filter: "drop-shadow(0 0 22px rgba(255,255,255,.4))" } : undefined}>
      <path d="M7 72H45L78 7L108 158L138 72H183" />
    </svg>
  );
}
