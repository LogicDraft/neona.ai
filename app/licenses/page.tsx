export default function LicensesPage() {
  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-3xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-[calc(2rem+env(safe-area-inset-top))] sm:px-6">
      <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <h1 className="text-3xl font-semibold tracking-tight">Licenses</h1>
        <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-300">Third-party package licenses and attribution notices should be listed on this page.</p>
      </article>
    </main>
  );
}
