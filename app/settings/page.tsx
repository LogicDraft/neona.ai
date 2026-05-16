import type { Metadata } from "next";
import Link from "next/link";
import ClearOfflineCacheButton from "@/components/clear-offline-cache-button";

export const metadata: Metadata = {
  title: "Settings — Neona AI",
  description: "Manage offline data, storage, and app preferences.",
};

/* ─── Small icon components (server-safe SVG) ──────────────────────────── */
function WifiOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 flex-shrink-0 text-zinc-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

/* ─── Nav links data ────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { href: "/help", label: "Help center" },
  { href: "/terms", label: "Terms of use" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/licenses", label: "Open-source licenses" },
  { href: "/about", label: "About Neona AI" },
] as const;

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function SettingsPage() {
  return (
    <main
      className="
        mx-auto min-h-[100dvh] w-full max-w-2xl
        px-4
        pb-[calc(6rem+env(safe-area-inset-bottom))]
        pt-[calc(2rem+env(safe-area-inset-top))]
        sm:px-6
      "
    >
      {/* ── Page header ── */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Manage your app data and preferences.
        </p>
      </header>

      <div className="space-y-4">
        {/* ── Storage & Offline section ── */}
        <section
          aria-labelledby="storage-section-heading"
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900"
        >
          {/* Section header */}
          <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4 dark:border-white/[0.06]">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
              <WifiOffIcon />
            </span>
            <div>
              <h2
                id="storage-section-heading"
                className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Storage &amp; Offline data
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Cache Storage, IndexedDB, localStorage, service workers
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-4">
            <ClearOfflineCacheButton variant="destructive" />
            <p className="mt-2.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              Deletes all PWA caches, IndexedDB databases, local &amp; session
              storage, and unregisters the service worker. Works on mobile,
              tablet, and desktop. The page reloads automatically after clearing.
            </p>
          </div>
        </section>

        {/* ── Links section ── */}
        <section aria-labelledby="links-section-heading">
          <h2
            id="links-section-heading"
            className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500"
          >
            Support &amp; Legal
          </h2>

          <nav
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900"
            aria-label="Settings navigation"
          >
            <ul role="list" className="divide-y divide-gray-100 dark:divide-white/[0.06]">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="
                      flex min-h-[48px] items-center justify-between
                      gap-3 px-5 py-3 text-sm text-zinc-700
                      transition-colors hover:bg-gray-50
                      dark:text-zinc-200 dark:hover:bg-zinc-800
                    "
                  >
                    <span>{label}</span>
                    <span className="flex items-center gap-1">
                      <ExternalLinkIcon />
                      <ChevronRightIcon />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </section>

        {/* ── App version badge ── */}
        <p className="px-1 text-center text-xs text-zinc-400 dark:text-zinc-600">
          Neona AI · PWA
        </p>
      </div>
    </main>
  );
}
