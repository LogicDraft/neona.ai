import type { Metadata } from "next";
import Link from "next/link";
import ClearOfflineCacheButton from "@/components/clear-offline-cache-button";
import ModelSelectorButton from "@/components/model-selector-sheet";

export const metadata: Metadata = {
  title: "Settings — Neona AI",
  description: "Manage your account, preferences, and app data.",
};

/* ──────────────────────────────────────────────────────────────────────────
   Inline SVG icons (server-safe)
────────────────────────────────────────────────────────────────────────── */
function ChevronRight({ className = "h-4 w-4 text-zinc-500 flex-shrink-0" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Shared card wrapper
────────────────────────────────────────────────────────────────────────── */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl bg-zinc-800/50 ring-1 ring-white/8 ${className}`}>
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Row variants
────────────────────────────────────────────────────────────────────────── */
function LinkRow({
  href,
  icon,
  label,
  sublabel,
  trailing,
  external = false,
  divider = true,
  destructive = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  trailing?: React.ReactNode;
  external?: boolean;
  divider?: boolean;
  destructive?: boolean;
}) {
  return (
    <div className={divider ? "border-b border-white/8 last:border-0" : ""}>
      <Link
        href={href}
        className={`flex min-h-[56px] items-center gap-3.5 px-4 py-3 transition-colors hover:bg-white/5 ${destructive ? "text-red-400" : "text-zinc-100"}`}
      >
        {icon && (
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl">
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium ${destructive ? "text-red-400" : "text-zinc-100"}`}>
            {label}
          </p>
          {sublabel && (
            <p className="mt-0.5 truncate text-xs text-zinc-500">{sublabel}</p>
          )}
        </div>
        {trailing ?? (external ? <ExternalIcon /> : <ChevronRight />)}
      </Link>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Static label row (for items where the trigger is a client component)
────────────────────────────────────────────────────────────────────────── */
function StaticRow({
  icon,
  label,
  sublabel,
  children,
  divider = true,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  children?: React.ReactNode;
  divider?: boolean;
}) {
  return (
    <div className={`flex min-h-[56px] items-center gap-3.5 px-4 py-3 ${divider ? "border-b border-white/8 last:border-0" : ""}`}>
      {icon && (
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl">
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-100">{label}</p>
        {sublabel && (
          <p className="mt-0.5 truncate text-xs text-zinc-500">{sublabel}</p>
        )}
      </div>
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Section label
────────────────────────────────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">
      {children}
    </p>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Page
────────────────────────────────────────────────────────────────────────── */
export default function SettingsPage() {
  return (
    <main
      className="
        mx-auto min-h-[100dvh] w-full max-w-lg
        bg-[#121212]
        px-4
        pb-[calc(6rem+env(safe-area-inset-bottom))]
        pt-[calc(env(safe-area-inset-top))]
        text-zinc-100
        sm:pt-6
      "
    >
      {/* ── Navigation bar ── */}
      <div className="flex items-center justify-center py-4 sm:py-5">
        <Link
          href="/"
          className="absolute left-4 flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-white/8 hover:text-zinc-100 transition-colors sm:left-6"
          aria-label="Go back"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </Link>
        <h1 className="text-base font-semibold">Settings</h1>
      </div>

      <div className="space-y-6">

        {/* ── Plan card ── */}
        <Card>
          <div className="flex items-center gap-4 p-4">
            {/* App icon */}
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-lg text-lg font-bold select-none">
              N<span className="text-[10px] font-black">+</span>
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-zinc-100">Neona.ai</span>
                <span className="rounded-md bg-zinc-700 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400">
                  Free
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-500">
                Upgrade to Neona Pro for advanced features and unlimited access.
              </p>
            </div>
            <Link
              href="/about"
              className="flex-shrink-0 rounded-full border border-violet-500/60 bg-violet-500/10 px-3.5 py-1.5 text-xs font-semibold text-violet-400 transition-colors hover:bg-violet-500/20"
            >
              Upgrade
            </Link>
          </div>
        </Card>

        {/* ── Account ── */}
        <section aria-labelledby="account-section">
          <SectionLabel>Account</SectionLabel>
          <Card>
            <LinkRow
              href="/auth/connected"
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              }
              label="Connect your account"
              sublabel="Sync your data across devices"
              trailing={
                <span className="ml-2 flex-shrink-0 rounded-lg bg-zinc-700/80 px-2.5 py-1 text-xs text-zinc-400">
                  Not connected
                </span>
              }
            />
            <LinkRow
              href="/auth/signin"
              icon={
                /* Google G logo */
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              }
              label="Connect with Google"
              sublabel="Use your Google account to sign in"
              divider={false}
            />
          </Card>
        </section>

        {/* ── Preferences ── */}
        <section aria-labelledby="preferences-section">
          <SectionLabel>Preferences</SectionLabel>
          <Card>
            <LinkRow
              href="/settings/appearance"
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              }
              label="Appearance"
              trailing={
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-zinc-500">Dark</span>
                  <ChevronRight />
                </div>
              }
            />
            {/* Default AI Model row — client component embedded in server page */}
            <StaticRow
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-violet-400" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              }
              label="Default AI Model"
              divider={false}
            >
              <ModelSelectorButton />
            </StaticRow>
          </Card>
        </section>

        {/* ── Data & Privacy ── */}
        <section aria-labelledby="data-section">
          <SectionLabel>Data &amp; Privacy</SectionLabel>
          <Card>
            <LinkRow
              href="/privacy"
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>
                </svg>
              }
              label="Privacy Settings"
              sublabel="Manage your data and privacy preferences"
            />
            <LinkRow
              href="/terms"
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <ellipse cx="12" cy="12" rx="10" ry="10"/><path d="M12 6v6l4 2"/>
                </svg>
              }
              label="Data Controls"
              sublabel="Export, delete, or manage your data"
            />
            {/* Clear cache — uses the client component */}
            <div className="border-b border-white/8 last:border-0">
              <div className="flex min-h-[56px] items-center gap-3.5 px-4 py-3">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6"/><path d="M10 11v6M14 11v6"/>
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <ClearOfflineCacheButton
                    variant="neutral"
                    className="!justify-start !border-0 !bg-transparent !p-0 !text-sm !font-medium !text-red-400 hover:!bg-transparent"
                  />
                  <p className="mt-0.5 text-xs text-zinc-500">Permanently delete all offline cached data</p>
                </div>
                <ChevronRight />
              </div>
            </div>
          </Card>
        </section>

        {/* ── About ── */}
        <section aria-labelledby="about-section">
          <SectionLabel>About</SectionLabel>
          <Card>
            <LinkRow
              href="/about"
              icon={
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 text-[11px] font-bold text-white select-none">
                  N
                </span>
              }
              label="About Neona.ai"
              sublabel="Version 1.0.0"
            />
            <LinkRow
              href="/help"
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>
                </svg>
              }
              label="Help &amp; Support"
              sublabel="Get help or contact support"
              external
              divider={false}
            />
          </Card>
        </section>

        {/* ── Log out ── */}
        <Card>
          <LinkRow
            href="/auth/signout"
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            }
            label="Log out"
            destructive
            divider={false}
            trailing={<span />}
          />
        </Card>

        {/* Safe-area spacer */}
        <div className="h-2" aria-hidden />
      </div>
    </main>
  );
}
