"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { signIn, useSession } from "next-auth/react";
import ChatInput from "@/components/chat-input";
import type { ParsedItem } from "@/lib/schemas";
import { clearOfflineData } from "@/lib/cache-utils";
import { getStoredModelId, getModelById } from "@/lib/model-config";
import { ModelSelectorSheet } from "@/components/model-selector-sheet";

type Role = "user" | "assistant";
type Message = { id: string; role: Role; content: string; ts?: number };

function uid() { return Math.random().toString(36).slice(2, 10); }

function formatParsed(item: ParsedItem) {
  const when = item.allDay
    ? `${item.date} all day`
    : `${item.date} ${item.startTime ?? ""}`.trim();
  return [`I understood this as a ${item.kind}: **${item.title}**.`, `📅 When: ${when} (${item.timeZone})`, item.description ? `📝 Details: ${item.description}` : null]
    .filter(Boolean).join("\n");
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
      {!isUser && <div className="ai-avatar flex-shrink-0">✨</div>}
      <div className={`max-w-[80%] px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap break-words md:max-w-[68%] ${isUser ? "msg-bubble-user" : "msg-bubble-ai"}`}>
        {message.content}
      </div>
    </div>
  );
}

/* ── Sidebar chat item ── */
function ChatItem({ label, active, icon = "💬" }: { label: string; active?: boolean; icon?: string }) {
  return (
    <button type="button" className={`sidebar-item ${active ? "active" : ""}`}>
      <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
      <span className="sidebar-chat-text">{label}</span>
    </button>
  );
}

/* ── Toast ── */
function useToast() {
  const [msg, setMsg] = useState("");
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((text: string) => {
    setMsg(text);
    setVisible(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 2400);
  }, []);
  return { msg, visible, show };
}

const SUGGESTIONS = [
  { icon: "📅", label: "Create an event", desc: "Add to Google Calendar instantly", text: "Schedule a team meeting tomorrow at 2pm" },
  { icon: "✅", label: "Create a task", desc: "Add to Google Tasks", text: "Create a task to review project proposal by Friday" },
  { icon: "⏰", label: "Set a reminder", desc: "Never miss what matters", text: "Remind me to call mom every Sunday at 5pm" },
  { icon: "🗓", label: "Plan my day", desc: "Organize your schedule", text: "Plan my day tomorrow with meetings, gym, and lunch" },
];

const RECENT_CHATS = [
  { label: "Schedule team sync tomorrow", icon: "📅" },
  { label: "Birthday dinner reminder", icon: "🎂" },
  { label: "Dentist appointment Friday", icon: "🦷" },
  { label: "Gym every morning 7am", icon: "💪" },
  { label: "Project deadline next week", icon: "⚡" },
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
  const [messages, setMessages] = useState<Message[]>([]);
  const endRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const currentModel = getModelById(currentModelId);
  const isFirstMessage = messages.length === 0;

  const chats = useMemo(() => RECENT_CHATS, []);

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
        body: JSON.stringify({ text: finalText, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" }),
      });
      const parsed = (await parseResponse.json()) as { item?: ParsedItem; error?: string };
      if (!parseResponse.ok || !parsed.item) throw new Error(parsed.error ?? "Unable to parse request.");
      const item = parsed.item;

      if (item.clarification) {
        setMessages((m) => [...m, { id: uid(), role: "assistant", content: item.clarification! }]);
        return;
      }

      if (!googleConnected) {
        setMessages((m) => [...m, { id: uid(), role: "assistant", content: `${formatParsed(item)}\n\nConnect Google from the sidebar to create this automatically.` }]);
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
      setMessages((m) => [...m, { id: uid(), role: "assistant", content: `${formatParsed(item)}\n\n✅ Added to ${result.provider === "tasks" ? "Google Tasks" : "Google Calendar"}: **${result.summary}**` }]);
    } catch (error) {
      setMessages((m) => [...m, { id: uid(), role: "assistant", content: error instanceof Error ? error.message : "Something went wrong." }]);
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
    try { await clearOfflineData({ reload: true }); }
    catch { setClearingCache(false); window.alert("Failed to clear offline cache."); }
  }

  const userInitial = session?.user?.name?.[0]?.toUpperCase() ?? "N";
  const userName = session?.user?.name ?? "Neona User";
  const userEmail = session?.user?.email ?? "user@gmail.com";

  /* ─────────────────────────────────────────
     SIDEBAR CONTENT (shared desktop/mobile)
  ───────────────────────────────────────── */
  function SidebarContent({ mobile = false }: { mobile?: boolean }) {
    return (
      <>
        {/* Header */}
        <div style={{ padding: "20px 16px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <div className="sidebar-logo-orb" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700 }}>Neona.ai</div>
            <div style={{ fontSize: 11, color: "var(--text3)" }}>Turn words into events</div>
          </div>
          {mobile && (
            <button type="button" className="collapse-btn" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
          {!mobile && (
            <button type="button" className="collapse-btn" onClick={() => setSidebarCollapsed(v => !v)} aria-label="Collapse sidebar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
        </div>

        {/* New chat */}
        <div style={{ margin: "12px 12px 8px" }}>
          <button className="new-chat-btn" type="button" onClick={() => { setMessages([]); if (mobile) setDrawerOpen(false); }}>
            <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="new-chat-btn-label sidebar-chat-text">New Chat</span>
          </button>
        </div>

        {/* Search */}
        <div style={{ margin: "0 12px 12px", position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text3)", fontSize: 13 }}>🔍</span>
          <input
            type="text"
            placeholder="Search chats…"
            style={{
              width: "100%", background: "var(--surface2)", border: "1px solid var(--border)",
              borderRadius: "var(--radius2)", padding: "10px 14px 10px 36px",
              fontSize: 14, color: "var(--text)", outline: "none",
            }}
          />
        </div>

        {/* Chat list */}
        <div className="scrollbar-thin" style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
          <div className="sidebar-label" style={{ maxHeight: "none", opacity: 1 }}>Recent</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {chats.map((chat, i) => (
              <ChatItem key={chat.label} label={chat.label} icon={chat.icon} active={i === 0} />
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div style={{ padding: 12, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
          {/* Google connect */}
          {!googleConnected ? (
            <div className="google-connect-card">
              <p style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>🗓 Google Calendar</p>
              <span style={{ fontSize: 11, color: "var(--text3)", display: "block", marginBottom: 10 }}>Connect to create &amp; sync events</span>
              <button
                type="button"
                onClick={() => { const o = typeof window !== "undefined" ? window.location.origin : ""; void signIn("google", { callbackUrl: `${o}/auth/connected` }); }}
                style={{ width: "100%", background: "#fff", color: "#1c1c1e", borderRadius: 10, padding: 9, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Connect Google
              </button>
            </div>
          ) : (
            <div style={{ background: "linear-gradient(135deg, rgba(52,211,153,0.12), rgba(96,165,250,0.08))", border: "1px solid rgba(52,211,153,0.2)", borderRadius: "var(--radius2)", padding: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <span className="status-dot green" />
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Google Connected</p>
                <span style={{ fontSize: 11, color: "var(--text3)" }}>{userEmail} · Syncing</span>
              </div>
            </div>
          )}

          {/* Profile */}
          <div
            onClick={() => { if (mobile) setDrawerOpen(false); }}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--radius2)", cursor: "pointer" }}
          >
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--grad)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
              {userInitial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName}</div>
              <div style={{ fontSize: 11, color: "var(--text3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userEmail}</div>
            </div>
            <Link href="/settings" style={{ color: "var(--text3)", fontSize: 14, textDecoration: "none" }}>⚙️</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <div style={{ display: "flex", height: "100dvh", width: "100%", overflow: "hidden", background: "var(--bg)", color: "var(--text)" }}>

      {/* Desktop sidebar */}
      <aside className={`sidebar hidden md:flex ${sidebarCollapsed ? "collapsed" : ""}`}>
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="md:hidden">
          <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} role="presentation" />
          <aside className="drawer">
            <SidebarContent mobile />
          </aside>
        </div>
      )}

      {/* Main */}
      <main style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, overflow: "hidden" }}>

        {/* Header */}
        <header className="chat-header" style={{ gap: 8 }}>
          {/* Hamburger (mobile) */}
          <button type="button" className="header-btn md:hidden" onClick={() => setDrawerOpen(true)} aria-label="Open navigation">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          {/* Title */}
          <span style={{ flex: 1, textAlign: "center", fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600 }}>
            Neona.ai
          </span>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {/* Model badge (desktop) */}
            <button type="button" className="model-badge hidden md:inline-flex" onClick={() => setModelSheetOpen(true)} title="Change AI model">
              <svg viewBox="0 0 24 24" style={{ width: 10, height: 10 }} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
              </svg>
              {currentModel.name}
            </button>

            {/* Theme toggle */}
            <button
              type="button"
              className="header-btn"
              title="Toggle theme"
              style={{ fontSize: 18 }}
              onClick={() => {
                const root = document.documentElement;
                const current = root.getAttribute("data-theme");
                root.setAttribute("data-theme", current === "light" ? "dark" : "light");
                toast.show(current === "light" ? "🌙 Dark mode" : "☀️ Light mode");
              }}
            >🌙</button>

            {/* Profile */}
            <div style={{ position: "relative" }} ref={profileRef}>
              <button
                type="button"
                id="profile-menu-btn"
                className="profile-avatar"
                onClick={() => setProfileOpen(v => !v)}
                aria-label="Profile menu"
                aria-expanded={profileOpen}
              >
                {userInitial}
              </button>
              {profileOpen && (
                <div className="dropdown-menu">
                  {session?.user && (
                    <div style={{ padding: "8px 12px 8px", marginBottom: 4, borderBottom: "1px solid var(--border)" }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{userName}</p>
                      <p style={{ fontSize: 11, color: "var(--text3)" }}>{userEmail}</p>
                    </div>
                  )}
                  {[
                    { href: "/settings", label: "⚙️  Settings" },
                    { href: "/help",     label: "❓  Help center" },
                    { href: "/terms",    label: "📄  Terms of use" },
                    { href: "/privacy",  label: "🛡️  Privacy policy" },
                    { href: "/about",    label: "ℹ️  About" },
                  ].map(({ href, label }) => (
                    <Link key={href} href={href} className="dropdown-item" onClick={() => setProfileOpen(false)}>{label}</Link>
                  ))}
                  <button
                    type="button"
                    className="dropdown-item"
                    style={{ color: "#ff453a" }}
                    onClick={() => { setProfileOpen(false); toast.show("👋 Signed out"); }}
                  >🚪  Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Messages area */}
        <div className="scrollbar-thin" style={{ flex: 1, overflowY: "auto", background: "var(--bg)" }}>
          <div style={{ maxWidth: 720, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 16, padding: "0 16px" }}>

            {/* Welcome state */}
            {isFirstMessage && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 0 24px", animation: "fade-up 0.6s ease forwards" }}>
                <div className="logo-orb" style={{ marginBottom: 24 }} />
                <h1 className="welcome-title">How can Neona<br />help you today?</h1>
                <p className="welcome-sub">Turn natural language into Google Calendar events, tasks &amp; reminders.</p>
                <div className="suggestion-grid">
                  {SUGGESTIONS.map((s) => (
                    <button key={s.label} type="button" className="suggestion-card" onClick={() => void submit(s.text)}>
                      <span style={{ fontSize: 22 }}>{s.icon}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)", lineHeight: 1.3 }}>{s.label}</span>
                      <span style={{ fontSize: 11, color: "var(--text3)", lineHeight: 1.4 }}>{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "16px 0" }}>
              {messages.map((msg) => <MessageRow key={msg.id} message={msg} />)}
              {loading && (
                <div className="flex items-end gap-2.5">
                  <div className="ai-avatar flex-shrink-0">✨</div>
                  <ThinkingDots />
                </div>
              )}
            </div>

            <div ref={endRef} />
          </div>
        </div>

        {/* Input area */}
        <div style={{ background: "var(--bg)", borderTop: "1px solid var(--border)", padding: `10px 12px calc(10px + var(--safe-bottom))` }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            {/* Mobile: model badge */}
            <div className="flex items-center justify-between mb-2 md:hidden">
              <button type="button" className="model-badge" onClick={() => setModelSheetOpen(true)}>
                <svg viewBox="0 0 24 24" style={{ width: 10, height: 10 }} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                </svg>
                {currentModel.name}
              </button>
              <span style={{ fontSize: 11, color: "var(--text3)" }}>Enter or ⇧+Enter for newline</span>
            </div>
            <ChatInput value={input} onChange={setInput} onSubmit={() => void submit()} disabled={loading} />
            <p style={{ textAlign: "center", fontSize: 11, color: "var(--text3)", marginTop: 6 }}>
              Neona may make mistakes. Always verify events before saving.
            </p>
          </div>
        </div>
      </main>

      {/* Model selector sheet */}
      <ModelSelectorSheet open={modelSheetOpen} onClose={() => setModelSheetOpen(false)} onSelect={(id) => setCurrentModelId(id)} />

      {/* Toast */}
      <div className={`toast-bar ${toast.visible ? "show" : ""}`}>{toast.msg}</div>
    </div>
  );
}
