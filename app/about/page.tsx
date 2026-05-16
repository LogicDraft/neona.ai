export default function AboutPage() {
  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-3xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-[calc(2rem+env(safe-area-inset-top))] sm:px-6">
      <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <h1 className="text-3xl font-semibold tracking-tight">About</h1>
        <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-300">Neona AI Scheduler is a modern assistant that transforms natural language into calendar events and task actions with Google integrations.</p>
        <div className="mt-6 grid gap-3 text-sm">
          <a className="rounded-xl border border-gray-200 px-4 py-3 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-zinc-800" href="https://github.com/LogicDraft" target="_blank" rel="noreferrer">Github: https://github.com/LogicDraft</a>
          <a className="rounded-xl border border-gray-200 px-4 py-3 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-zinc-800" href="mailto:gowdagowtham1025@gmail.com">Support: gowdagowtham1025@gmail.com</a>
        </div>
      </article>
    </main>
  );
}
