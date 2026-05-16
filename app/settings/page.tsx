import Link from "next/link";
import ClearOfflineCacheButton from "@/components/clear-offline-cache-button";

export default function SettingsPage() {
  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-2xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-[calc(2rem+env(safe-area-inset-top))] sm:px-6">
      <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
            Manage offline data and support links. Cache clearing works across mobile, tablet, and desktop.
          </p>
        </header>

        <section className="mt-6 space-y-3">
          <ClearOfflineCacheButton />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            This removes service worker caches, local/session storage, unregisters service workers, and reloads the app.
          </p>
        </section>

        <section className="mt-8 grid gap-2 text-sm">
          <Link className="rounded-xl border border-gray-200 px-4 py-3 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-zinc-800" href="/help">
            Help center
          </Link>
          <Link className="rounded-xl border border-gray-200 px-4 py-3 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-zinc-800" href="/terms">
            Terms of use
          </Link>
          <Link className="rounded-xl border border-gray-200 px-4 py-3 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-zinc-800" href="/privacy">
            Privacy policy
          </Link>
          <Link className="rounded-xl border border-gray-200 px-4 py-3 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-zinc-800" href="/licenses">
            Licenses
          </Link>
          <Link className="rounded-xl border border-gray-200 px-4 py-3 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-zinc-800" href="/about">
            About
          </Link>
        </section>
      </article>
    </main>
  );
}
