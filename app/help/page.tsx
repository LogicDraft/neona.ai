import Link from "next/link";

export default function HelpPage() {
  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-3xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-[calc(2rem+env(safe-area-inset-top))] sm:px-6">
      <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <h1 className="text-3xl font-semibold tracking-tight">Help center</h1>
        <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">Need support with Neona AI Scheduler? Use the contacts below.</p>

        <div className="mt-6 grid gap-3 text-sm">
          <a className="rounded-xl border border-gray-200 px-4 py-3 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-zinc-800" href="https://github.com/LogicDraft" target="_blank" rel="noreferrer">Github: https://github.com/LogicDraft</a>
          <a className="rounded-xl border border-gray-200 px-4 py-3 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-zinc-800" href="mailto:gowdagowtham1025@gmail.com">Gmail: gowdagowtham1025@gmail.com</a>
        </div>

        <h2 className="mt-8 text-lg font-semibold">Legal & product</h2>
        <div className="mt-3 grid gap-2 text-sm">
          <Link className="rounded-xl border border-gray-200 px-4 py-3 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-zinc-800" href="/terms">Terms of use</Link>
          <Link className="rounded-xl border border-gray-200 px-4 py-3 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-zinc-800" href="/privacy">Privacy policy</Link>
          <Link className="rounded-xl border border-gray-200 px-4 py-3 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-zinc-800" href="/licenses">Licenses</Link>
          <Link className="rounded-xl border border-gray-200 px-4 py-3 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-zinc-800" href="/about">About</Link>
        </div>
      </article>
    </main>
  );
}
