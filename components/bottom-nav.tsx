"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

function NavButton({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  const path = usePathname();
  const active = path === href;

  return (
    <Link
      href={href}
      className={`flex min-w-[64px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition-colors ${
        active
          ? "bg-zinc-100 text-gray-900 dark:bg-zinc-800 dark:text-white"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
      }`}
      aria-label={label}
    >
      <div className="flex h-6 w-6 items-center justify-center [&>svg]:h-5 [&>svg]:w-5 [&>svg]:fill-current">
        {icon}
      </div>
      <span>{label}</span>
    </Link>
  );
}

export default function BottomNav() {
  const path = usePathname();

  if (path === "/") {
    return null;
  }

  return (
    <nav
      className="fixed bottom-2 left-1/2 z-50 flex w-[min(96vw,440px)] -translate-x-1/2 items-center justify-between rounded-2xl border border-gray-200 bg-white/95 px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-lg backdrop-blur md:hidden dark:border-white/10 dark:bg-zinc-900/95"
      role="navigation"
      aria-label="Primary"
    >
      <NavButton href="/" label="Chat" icon={<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>} />
      <NavButton href="/help" label="Help" icon={<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm.5 15h-1v-1h1v1Zm1.07-7.75c-.9.37-1.57 1.12-1.57 2.05h-1v-.2c0-1.1.63-2.07 1.6-2.6.7-.39 1.2-1.03 1.2-1.79 0-1.2-1-2.2-2.2-2.2s-2.2 1-2.2 2.2H9c0-1.8 1.5-3.2 3.5-3.2s3.5 1.4 3.5 3.2c0 1.25-.74 2.15-1.78 2.8Z"/></svg>} />
      <NavButton href="/about" label="About" icon={<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-6h2v6Zm0-8h-2V7h2v2Z"/></svg>} />
      <NavButton href="/settings" label="Settings" icon={<svg viewBox="0 0 24 24"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>} />
    </nav>
  );
}