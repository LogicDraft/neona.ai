"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import ChatInput from "@/components/chat-input";
import type { ParsedItem } from "@/lib/schemas";

type Role = "user" | "assistant";

type Message = {
  id: string;
  role: Role;
  content: string;
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function formatParsed(item: ParsedItem) {
  const when = item.allDay ? `${item.date} all day` : `${item.date} ${item.startTime ?? ""}`.trim();
  return [`I understood this as a ${item.kind}: ${item.title}.`, `When: ${when} (${item.timeZone})`, item.description ? `Details: ${item.description}` : null]
    .filter(Boolean)
    .join("\n");
}

export default function ChatShell() {
  const { data: session } = useSession();
  const googleConnected = Boolean(session?.accessToken);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: uid(), role: "assistant", content: "Hi, I can help schedule events and tasks from natural language." },
  ]);
  const endRef = useRef<HTMLDivElement | null>(null);

  const chats = useMemo(
    () => [
      "Design review",
      "Weekly status reminder",
      "Product launch checklist",
      "Follow-up with Maya",
    ],
    [],
  );

  async function submit() {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setLoading(true);
    setMessages((current) => [...current, { id: uid(), role: "user", content: text }]);

    try {
      const parseResponse = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" }),
      });
      const parsed = (await parseResponse.json()) as { item?: ParsedItem; error?: string };

      if (!parseResponse.ok || !parsed.item) {
        throw new Error(parsed.error ?? "Unable to parse request.");
      }

      if (parsed.item.clarification) {
        setMessages((current) => [...current, { id: uid(), role: "assistant", content: parsed.item.clarification as string }]);
        return;
      }

      if (!googleConnected) {
        setMessages((current) => [
          ...current,
          {
            id: uid(),
            role: "assistant",
            content: `${formatParsed(parsed.item)}\n\nConnect Google from the sidebar menu and send this again to create it automatically.`,
          },
        ]);
        return;
      }

      const scheduleResponse = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: parsed.item }),
      });
      const scheduled = (await scheduleResponse.json()) as { result?: { provider: "calendar" | "tasks"; summary: string }; error?: string };

      if (!scheduleResponse.ok || !scheduled.result) {
        throw new Error(scheduled.error ?? "Unable to create item.");
      }

      setMessages((current) => [
        ...current,
        {
          id: uid(),
          role: "assistant",
          content: `${formatParsed(parsed.item)}\n\nAdded to ${scheduled.result.provider === "tasks" ? "Google Tasks" : "Google Calendar"}: ${scheduled.result.summary}`,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: uid(),
          role: "assistant",
          content: error instanceof Error ? error.message : "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
      window.requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }));
    }
  }

  const sidebarWidth = sidebarCollapsed ? "md:w-20" : "md:w-72";

  return (
    <div className="relative flex h-[100dvh] w-full overflow-hidden bg-white text-zinc-900 dark:bg-[#212121] dark:text-zinc-100">
      <div className="hidden md:block">
        <aside className={`h-full border-r border-gray-200 bg-gray-50 transition-all dark:border-white/10 dark:bg-zinc-900 ${sidebarWidth}`}>
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-3 pt-4">
              {!sidebarCollapsed ? <span className="text-sm font-semibold">Neona</span> : null}
              <button
                type="button"
                onClick={() => setSidebarCollapsed((v) => !v)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-zinc-700 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200"
                aria-label="Collapse sidebar"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
            </div>

            <div className="px-3 pt-3">
              <button className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-left text-sm font-medium dark:border-white/10 dark:bg-zinc-800" type="button">
                + New chat
              </button>
            </div>

            {!sidebarCollapsed ? (
              <div className="scrollbar-thin mt-4 flex-1 overflow-y-auto px-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Recent</p>
                <div className="grid gap-1">
                  {chats.map((chat) => (
                    <button key={chat} className="rounded-lg px-3 py-2 text-left text-sm text-zinc-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800" type="button">
                      {chat}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="border-t border-gray-200 p-3 dark:border-white/10">
              <button
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm dark:border-white/10 dark:bg-zinc-800"
                type="button"
                onClick={() => {
                  const origin = typeof window !== "undefined" ? window.location.origin : "";
                  void signIn("google", { callbackUrl: `${origin}/auth/connected` });
                }}
              >
                {googleConnected ? "Google connected" : "Connect Google"}
              </button>
            </div>
          </div>
        </aside>
      </div>

      {drawerOpen ? (
        <div className="md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 border-r border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Neona</span>
              <button type="button" onClick={() => setDrawerOpen(false)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10">✕</button>
            </div>
            <div className="mt-4 grid gap-2">
              <button className="rounded-xl border border-gray-200 px-3 py-2 text-left text-sm dark:border-white/10" type="button">+ New chat</button>
              <button className="rounded-xl border border-gray-200 px-3 py-2 text-left text-sm dark:border-white/10" type="button" onClick={() => {
                const origin = typeof window !== "undefined" ? window.location.origin : "";
                void signIn("google", { callbackUrl: `${origin}/auth/connected` });
              }}>{googleConnected ? "Google connected" : "Connect Google"}</button>
            </div>
            <div className="mt-5 grid gap-1">
              {chats.map((chat) => (
                <button key={chat} className="rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-zinc-800" type="button">{chat}</button>
              ))}
            </div>
            <div className="mt-6 grid gap-1 border-t border-gray-200 pt-4 text-sm dark:border-white/10">
              <Link href="/help" className="rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800">Help center</Link>
              <Link href="/terms" className="rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800">Terms of use</Link>
              <Link href="/privacy" className="rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800">Privacy policy</Link>
              <Link href="/licenses" className="rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800">Licenses</Link>
              <Link href="/about" className="rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800">About</Link>
            </div>
          </aside>
        </div>
      ) : null}

      <main className="relative flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 px-4 pt-safe backdrop-blur md:px-6 dark:border-white/10 dark:bg-[#212121]/90">
          <div className="mx-auto flex h-14 max-w-3xl items-center justify-between">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 md:hidden dark:border-white/10"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
            </button>
            <span className="text-sm font-semibold">Neona</span>
            <div className="relative">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 dark:border-white/10"
                onClick={() => setProfileOpen((v) => !v)}
                aria-label="Open profile menu"
              >
                N
              </button>
              {profileOpen ? (
                <div className="absolute right-0 z-50 mt-2 grid min-w-52 gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-xl dark:border-white/10 dark:bg-zinc-900">
                  <Link href="/help" className="rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800">Help center</Link>
                  <Link href="/terms" className="rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800">Terms of use</Link>
                  <Link href="/privacy" className="rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800">Privacy policy</Link>
                  <Link href="/licenses" className="rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800">Licenses</Link>
                  <Link href="/about" className="rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800">About</Link>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <div className="scrollbar-thin flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 pb-28 md:px-6">
            {messages.map((message) => (
              <div key={message.id} className={`w-full ${message.role === "user" ? "flex justify-end" : "flex justify-start"}`}>
                <div
                  className={`max-w-[92%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-[15px] leading-6 md:max-w-[78%] ${
                    message.role === "user"
                      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100"
                      : "bg-transparent text-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {loading ? (
              <div className="text-sm text-zinc-500 dark:text-zinc-400">Thinking...</div>
            ) : null}
            <div ref={endRef} />
          </div>
        </div>

        <div className="border-t border-gray-200 bg-white/95 px-4 py-3 pb-safe backdrop-blur md:px-6 dark:border-white/10 dark:bg-[#212121]/95">
          <div className="mx-auto w-full max-w-3xl">
            <ChatInput value={input} onChange={setInput} onSubmit={submit} disabled={loading} />
          </div>
        </div>
      </main>
    </div>
  );
}
