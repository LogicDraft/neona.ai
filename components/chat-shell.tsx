"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import ChatInput from "@/components/chat-input";
import type { ParsedItem } from "@/lib/schemas";
import { clearOfflineData } from "@/lib/cache-utils";
import { getStoredModelId, getModelById } from "@/lib/model-config";
import { ModelSelectorSheet } from "@/components/model-selector-sheet";

type Role = "user" | "assistant";
type Message = { id: string; role: Role; content: string; ts?: number };

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function formatParsed(item: ParsedItem) {
  const when = item.allDay
    ? `${item.date} all day`
    : `${item.date} ${item.startTime ?? ""}`.trim();
  return [`I understood this as a ${item.kind}: **${item.title}**.`, `📅 When: ${when} (${item.timeZone})`, item.description ? `📝 Details: ${item.description}` : null]
    .filter(Boolean)
    .join("\n");
}

/* ── Thinking indicator ── */
function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 msg-bubble-ai inline-flex">
      <span className="thinking-dot" />
      <span className="thinking-dot" />
      <span className="thinking-dot" />
    </div>
  );
}

/* ── Message row ── */
function MessageRow({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex items-end gap-2.5 msg-animate ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {!isUser && (
        <div className="ai-avatar flex-shrink-0">N</div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 text-[0.9375rem] leading-relaxed whitespace-pre-wrap break-words md:max-w-[68%] ${
          isUser ? "msg-bubble-user" : "msg-bubble-ai"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

/* ── Sidebar chat item ── */
function ChatItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <button type="button" className={`sidebar-item ${active ? "active" : ""}`}>
      <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0 opacity-60" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <span className="sidebar-chat-text">{label}</span>
    </button>
  );
}

/* ── Suggestion chips shown when no conversation ── */
const SUGGESTIONS = [
  "Schedule a meeting tomorrow at 3pm",
  "Remind me to call John on Friday",
  "Add team lunch next Monday noon",
  "Block focus time every morning 9–11am",
];

export default function ChatShell() {
  const { data: session } = useSession();
  const googleConnected = Boolean(session?.accessToken);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [modelSheetOpen, setModelSheetOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [currentModelId, setCurrentModelId] = useState(() =>
    typeof window !== "undefined" ? getStoredModelId() : "neona-3-5"
  );
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uid(),
      role: "assistant",
      content: "Hi! I'm Neona ✨\nTell me what you'd like to schedule, and I'll handle the rest — events, tasks, reminders, you name it.",
    },
  ]);
  const endRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const currentModel = getModelById(currentModelId);

  const chats = useMemo(() => [
    "Design review meeting",
    "Weekly status reminder",
    "Product launch checklist",
    "Follow-up with Maya",
    "Q3 planning session",
  ], []);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function submit(text?: string) {
    const finalText = (text ?? input).trim();
    if (!finalText || loading) return;

    setInput("");
    setLoading(true);
    setMessages((m) => [...m, { id: uid(), role: "user", content: finalText, ts: Date.now() }]);

    try {
      const parseResponse = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: finalText,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        }),
      });
      const parsed = (await parseResponse.json()) as { item?: ParsedItem; error?: string };

      if (!parseResponse.ok || !parsed.item) throw new Error(parsed.error ?? "Unable to parse request.");

      const item = parsed.item;

      if (item.clarification) {
        setMessages((m) => [...m, { id: uid(), role: "assistant", content: item.clarification! }]);
        return;
      }

      if (!googleConnected) {
        setMessages((m) => [
          ...m,
          {
            id: uid(),
            role: "assistant",
            content: `${formatParsed(item)}\n\nConnect Google from the sidebar to create this automatically.`,
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

      if (!scheduleResponse.ok || !scheduled.result) throw new Error(scheduled.error ?? "Unable to create item.");

      const result = scheduled.result;
      setMessages((m) => [
        ...m,
        {
          id: uid(),
          role: "assistant",
          content: `${formatParsed(item)}\n\n✅ Added to ${result.provider === "tasks" ? "Google Tasks" : "Google Calendar"}: **${result.summary}**`,
        },
      ]);
    } catch (error) {
      setMessages((m) => [
        ...m,
        { id: uid(), role: "assistant", content: error instanceof Error ? error.message : "Something went wrong." },
      ]);
    } finally {
      setLoading(false);
      window.requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }));
    }
  }

  async function handleClearOfflineCache() {
    if (clearingCache) return;
    const confirmed = window.confirm("Clear all offline data? You'll re-download assets on next visit.");
    if (!confirmed) return;
    setClearingCache(true);
    try {
      await clearOfflineData({ reload: true });
    } catch {
      setClearingCache(false);
      window.alert("Failed to clear offline cache.");
    }
  }

  const isFirstMessage = messages.length <= 1;

  /* ── Sidebar (desktop) ── */
  const Sidebar = (
    <aside className={`sidebar hidden md:flex ${sidebarCollapsed ? "collapsed" : ""}`}>
      {/* Logo row */}
      <div className="flex items-center justify-between px-3 pt-4 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-white text-sm font-black neona-gradient"
            aria-hidden
          >
            N
          </div>
          <span className="sidebar-logo-text neona-text-gradient">Neona.ai</span>
        </div>
        <button
          type="button"
          onClick={() => setSidebarCollapsed((v) => !v)}
          className="collapse-btn"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      {/* New chat */}
      <div className="px-2 pb-2 flex-shrink-0">
        <button className="new-chat-btn" type="button">
          <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span className="new-chat-btn-label sidebar-chat-text">New chat</span>
        </button>
      </div>

      {/* Chat list */}
      <div className="scrollbar-thin flex-1 overflow-y-auto px-2 py-1">
        <p className="sidebar-label">Recent</p>
        <div className="flex flex-col gap-0.5">
          {chats.map((chat, i) => (
            <ChatItem key={chat} label={chat} active={i === 0} />
          ))}
        </div>
      </div>

      {/* Bottom actions */}
      <div style={{ borderTop: "1px solid var(--border)" }} className="p-2 flex flex-col gap-2 flex-shrink-0">
        {/* Google connect */}
        <button
          type="button"
          onClick={() => {
            const origin = typeof window !== "undefined" ? window.location.origin : "";
            void signIn("google", { callbackUrl: `${origin}/auth/connected` });
          }}
          className={`google-pill w-full justify-center ${googleConnected ? "connected" : "disconnected"}`}
        >
          <span className={`status-dot ${googleConnected ? "online" : "offline"}`} />
          <span className="sidebar-chat-text">{googleConnected ? "Google connected" : "Connect Google"}</span>
        </button>

        {/* Clear cache */}
        <button
          type="button"
          onClick={() => void handleClearOfflineCache()}
          disabled={clearingCache}
          className="sidebar-item justify-center text-red-500 hover:!bg-red-500/10 disabled:opacity-50"
          style={{ color: "var(--neona-error, #ef4444)" }}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
          </svg>
          <span className="sidebar-chat-text" style={{ color: "#ef4444" }}>
            {clearingCache ? "Clearing…" : "Clear offline cache"}
          </span>
        </button>

        {/* Links */}
        <div className="flex flex-col gap-0.5">
          {[
            { href: "/help", label: "Help center" },
            { href: "/settings", label: "Settings" },
            { href: "/about", label: "About" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} className="sidebar-item">
              <span className="sidebar-chat-text text-xs">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );

  return (
    <div style={{ display: "flex", height: "100dvh", width: "100%", overflow: "hidden", background: "var(--surface-0)", color: "var(--text-primary)" }}>
      {Sidebar}

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="md:hidden">
          <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} role="presentation" />
          <aside className="drawer">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 pt-5 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-white text-sm font-black neona-gradient">N</div>
                <span className="text-base font-extrabold neona-text-gradient">Neona.ai</span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="collapse-btn"
                aria-label="Close menu"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* New chat */}
            <div className="px-3 pb-3 flex-shrink-0">
              <button className="new-chat-btn" type="button">
                <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New chat
              </button>
            </div>

            {/* Chat list */}
            <div className="scrollbar-thin flex-1 overflow-y-auto px-3">
              <p className="sidebar-label" style={{ maxHeight: "none", opacity: 1 }}>Recent</p>
              <div className="flex flex-col gap-0.5">
                {chats.map((chat, i) => (
                  <button key={chat} className={`sidebar-item ${i === 0 ? "active" : ""}`} type="button">{chat}</button>
                ))}
              </div>
            </div>

            {/* Drawer footer */}
            <div className="px-3 pb-6 pt-3 flex flex-col gap-2" style={{ borderTop: "1px solid var(--border)" }}>
              <button
                type="button"
                onClick={() => { const o = window.location.origin; void signIn("google", { callbackUrl: `${o}/auth/connected` }); }}
                className={`google-pill w-full justify-center ${googleConnected ? "connected" : "disconnected"}`}
              >
                <span className={`status-dot ${googleConnected ? "online" : "offline"}`} />
                {googleConnected ? "Google connected" : "Connect Google"}
              </button>
              {[{ href: "/help", label: "Help" }, { href: "/terms", label: "Terms" }, { href: "/privacy", label: "Privacy" }, { href: "/about", label: "About" }].map(({ href, label }) => (
                <Link key={href} href={href} className="sidebar-item" onClick={() => setDrawerOpen(false)}>{label}</Link>
              ))}
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, overflow: "hidden" }}>
        {/* Header */}
        <header className="chat-header">
          {/* Hamburger (mobile) */}
          <button
            type="button"
            className="collapse-btn md:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>

          {/* Center: logo (mobile) + model badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold neona-text-gradient md:hidden">Neona.ai</span>
            <button
              id="header-model-badge"
              type="button"
              className="model-badge hidden md:inline-flex"
              onClick={() => setModelSheetOpen(true)}
              title="Change AI model"
            >
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
              </svg>
              {currentModel.name}
            </button>
          </div>

          {/* Right: Google status + profile */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`google-pill hidden sm:inline-flex ${googleConnected ? "connected" : "disconnected"}`}
              onClick={() => {
                const origin = typeof window !== "undefined" ? window.location.origin : "";
                void signIn("google", { callbackUrl: `${origin}/auth/connected` });
              }}
            >
              <span className={`status-dot ${googleConnected ? "online" : "offline"}`} />
              {googleConnected ? "Connected" : "Connect Google"}
            </button>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                id="profile-menu-btn"
                className="profile-avatar"
                onClick={() => setProfileOpen((v) => !v)}
                aria-label="Profile menu"
                aria-expanded={profileOpen}
              >
                {session?.user?.name?.[0]?.toUpperCase() ?? "N"}
              </button>

              {profileOpen && (
                <div className="dropdown-menu">
                  {session?.user && (
                    <div className="px-3 py-2 mb-1" style={{ borderBottom: "1px solid var(--border)" }}>
                      <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{session.user.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{session.user.email}</p>
                    </div>
                  )}
                  {[
                    { href: "/settings", label: "Settings" },
                    { href: "/help", label: "Help center" },
                    { href: "/terms", label: "Terms of use" },
                    { href: "/privacy", label: "Privacy policy" },
                    { href: "/licenses", label: "Licenses" },
                    { href: "/about", label: "About" },
                  ].map(({ href, label }) => (
                    <Link key={href} href={href} className="dropdown-item" onClick={() => setProfileOpen(false)}>{label}</Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Messages area */}
        <div className="scrollbar-thin flex-1 overflow-y-auto" style={{ background: "var(--surface-0)" }}>
          <div className="mx-auto w-full max-w-3xl flex flex-col gap-4 px-4 py-6 pb-4 md:px-6">

            {/* Empty state with suggestions */}
            {isFirstMessage && (
              <div style={{ textAlign: "center", padding: "2rem 1rem 1.5rem" }}>
                <div className="ai-avatar mx-auto mb-4" style={{ width: 52, height: 52, borderRadius: 16, fontSize: 22 }}>N</div>
                <h1 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>What can I schedule for you?</h1>
                <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Describe any event, task, or reminder in natural language.</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="hint-chip"
                      onClick={() => void submit(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <MessageRow key={msg.id} message={msg} />
            ))}

            {loading && (
              <div className="flex items-end gap-2.5">
                <div className="ai-avatar flex-shrink-0">N</div>
                <ThinkingDots />
              </div>
            )}
            <div ref={endRef} />
          </div>
        </div>

        {/* Input bar */}
        <div
          style={{
            background: "var(--surface-0)",
            borderTop: "1px solid var(--border)",
            padding: "0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom))",
          }}
        >
          <div className="mx-auto w-full max-w-3xl">
            {/* Mobile: model badge above input */}
            <div className="flex items-center justify-between mb-2 md:hidden">
              <button
                type="button"
                className="model-badge"
                onClick={() => setModelSheetOpen(true)}
              >
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                </svg>
                {currentModel.name}
              </button>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>Enter or ⇧+Enter for newline</span>
            </div>
            <ChatInput value={input} onChange={setInput} onSubmit={() => void submit()} disabled={loading} />
          </div>
        </div>
      </main>

      {/* Model selector sheet */}
      <ModelSelectorSheet
        open={modelSheetOpen}
        onClose={() => setModelSheetOpen(false)}
        onSelect={(id) => setCurrentModelId(id)}
      />
    </div>
  );
}
