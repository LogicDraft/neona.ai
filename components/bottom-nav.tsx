"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

function NavButton({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  const path = usePathname();
  const active = path === href;
  return (
    <Link href={href} className={`bn-item ${active ? "active" : ""}`} aria-label={label}>
      <div className="bn-icon">{icon}</div>
      <div className="bn-label">{label}</div>
    </Link>
  );
}

export default function BottomNav() {
  return (
    <nav className="bottom-nav" role="navigation" aria-label="Primary">
      <NavButton href="/" label="Home" icon={<svg viewBox="0 0 24 24" className="icon"><path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z"/></svg>} />
      <NavButton href="/" label="Chat" icon={<svg viewBox="0 0 24 24" className="icon"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>} />
      <NavButton href="/help" label="Help" icon={<svg viewBox="0 0 24 24" className="icon"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm.5 15h-1v-1h1v1Zm1.07-7.75c-.9.37-1.57 1.12-1.57 2.05h-1v-.2c0-1.1.63-2.07 1.6-2.6.7-.39 1.2-1.03 1.2-1.79 0-1.2-1-2.2-2.2-2.2s-2.2 1-2.2 2.2H9c0-1.8 1.5-3.2 3.5-3.2s3.5 1.4 3.5 3.2c0 1.25-.74 2.15-1.78 2.8Z"/></svg>} />
      <NavButton href="/about" label="About" icon={<svg viewBox="0 0 24 24" className="icon"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-6h2v6Zm0-8h-2V7h2v2Z"/></svg>} />
      <NavButton href="/auth/connected" label="Account" icon={<svg viewBox="0 0 24 24" className="icon"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z"/></svg>} />
    </nav>
  );
}
