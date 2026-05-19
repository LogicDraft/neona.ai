"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { ParsedItem } from "@/lib/schemas";

type Message = {
  id: string;
  role: "user" | "ai";
  text: string;
  item?: ParsedItem;
  status?: "idle" | "saving" | "saved" | "error";
  error?: string;
};

type SettingKey = "calendar" | "tasks" | "advanced";

const sidebarItems = [
  { icon: "edit_square", label: "New task chat", active: true },
  { icon: "search", label: "Search plans" },
  { icon: "gavel", label: "Terms & Conditions" },
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function firstName(name?: string | null) {
  return name?.trim().split(/\s+/)[0] || "there";
}

function formatTaskTime(item: ParsedItem) {
  if (item.allDay || !item.startTime) return `${item.date} · All day`;
  return `${item.date} · ${item.startTime}${item.endTime ? `-${item.endTime}` : ""}`;
}

function MaterialIcon({ children, className = "" }: { children: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>;
}

function Header({
  onOpenSidebar,
  onNewChat,
}: {
  onOpenSidebar: () => void;
  onNewChat: () => void;
}) {
  return (
    <header className="app-header">
      <div className="header-left">
        <button className="icon-btn" aria-label="Open navigation" onClick={onOpenSidebar}>
          <MaterialIcon>menu</MaterialIcon>
        </button>
        <button className="model-selector" aria-label="Select model">
          Pro Extended
          <MaterialIcon className="small-icon">expand_more</MaterialIcon>
        </button>
      </div>
      <button className="icon-btn" aria-label="New chat" onClick={onNewChat}>
        <MaterialIcon>history</MaterialIcon>
      </button>
    </header>
  );
}

function SidebarDrawer({
  isOpen,
  onClose,
  onOpenSettings,
  onNewChat,
  isAuthenticated,
  userName,
  userEmail,
  onSignOut,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onNewChat: () => void;
  isAuthenticated: boolean;
  userName: string;
  userEmail?: string | null;
  onSignOut: () => void;
}) {
  return (
    <>
      <button className={`sidebar-overlay ${isOpen ? "show" : ""}`} aria-label="Close navigation" onClick={onClose} />
      <aside className={`gemini-sidebar ${isOpen ? "open" : ""}`} aria-label="Navigation">
        <div className="sidebar-header">Neona</div>
        <div className="sidebar-content">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              className={`menu-item ${item.active ? "active" : ""}`}
              onClick={() => {
                if (item.active) onNewChat();
              }}
            >
              <MaterialIcon>{item.icon}</MaterialIcon>
              <span>{item.label}</span>
            </button>
          ))}
          <button className="menu-item" onClick={onOpenSettings}>
            <MaterialIcon>settings</MaterialIcon>
            <span>Settings</span>
          </button>
        </div>
        <div className="sidebar-footer">
          <div className="profile-pic" aria-hidden="true" />
          <div className="profile-info">
            <span className="profile-name">{userName}</span>
            <span className="profile-tier">{isAuthenticated ? userEmail || "Google connected" : "Connect Google when ready"}</span>
          </div>
          <button className="footer-settings" aria-label={isAuthenticated ? "Sign out" : "Sign in"} onClick={onSignOut}>
            <MaterialIcon>{isAuthenticated ? "logout" : "login"}</MaterialIcon>
          </button>
        </div>
      </aside>
    </>
  );
}

function SettingsSheet({
  isOpen,
  settings,
  onToggle,
  onClose,
}: {
  isOpen: boolean;
  settings: Record<SettingKey, boolean>;
  onToggle: (key: SettingKey) => void;
  onClose: () => void;
}) {
  const rows: Array<{ key: SettingKey; title: string; desc: string }> = [
    { key: "calendar", title: "Sync to Google Calendar", desc: "Automatically add extracted dates" },
    { key: "tasks", title: "Sync to Google Tasks", desc: "Create actionable to-do items" },
    { key: "advanced", title: "Advanced Parsing", desc: "Use stronger context understanding" },
  ];

  return (
    <>
      <button className={`bottom-sheet-overlay ${isOpen ? "show" : ""}`} aria-label="Close settings" onClick={onClose} />
      <section className={`bottom-sheet ${isOpen ? "open" : ""}`} aria-label="Settings">
        <div className="sheet-handle" />
        <h2>Settings</h2>
        <div className="settings-list">
          {rows.map((row) => (
            <button key={row.key} className="setting-item" onClick={() => onToggle(row.key)} aria-pressed={settings[row.key]}>
              <span className="setting-info">
                <span className="setting-title">{row.title}</span>
                <span className="setting-desc">{row.desc}</span>
              </span>
              <span className={`toggle ${settings[row.key] ? "active" : ""}`} aria-hidden="true" />
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

function AuthModal({
  status,
  onLater,
}: {
  status: "loading" | "authenticated" | "unauthenticated";
  onLater: () => void;
}) {
  if (status === "authenticated") return null;

  return (
    <div className="modal-overlay show" role="dialog" aria-modal="true" aria-label="Connect Google">
      <div className="auth-card">
        <svg className="google-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        <h2 className="auth-title">Connect Google</h2>
        <p className="auth-desc">Neona.ai needs access to Google Tasks and Calendar to organize your plans.</p>
        <button className="btn-full btn-google" disabled={status === "loading"} onClick={() => signIn("google")}>
          {status === "loading" ? "Checking session..." : "Sign in with Google"}
        </button>
        <button className="btn-full btn-later" disabled={status === "loading"} onClick={onLater}>
          Maybe later
        </button>
      </div>
    </div>
  );
}

function GreetingArea({ name }: { name: string }) {
  return (
    <section className="greeting-container" aria-label="Greeting">
      <div className="magic-star" />
      <h1 className="greeting-text">
        Hi {name}, let&apos;s get
        <br />
        into it
      </h1>
    </section>
  );
}

function TypingDots() {
  return (
    <div className="message ai" aria-label="Neona is typing">
      <div className="msg-bubble">
        <div className="typing-dots">
          <div />
          <div />
          <div />
        </div>
      </div>
    </div>
  );
}

function TaskCard({
  item,
  status = "idle",
  error,
  isAuthenticated,
  onConfirm,
  onConnect,
}: {
  item: ParsedItem;
  status?: Message["status"];
  error?: string;
  isAuthenticated: boolean;
  onConfirm: () => void;
  onConnect: () => void;
}) {
  return (
    <div className="task-card">
      <div className="task-header">
        <MaterialIcon className="small-icon">auto_awesome</MaterialIcon>
        Google {item.kind === "event" ? "Event" : "Task"} Parsed
      </div>
      <div className="task-title">{item.title}</div>
      {item.description ? <p className="task-desc">{item.description}</p> : null}
      <div className="task-time">
        <MaterialIcon className="tiny-icon">event</MaterialIcon>
        {formatTaskTime(item)}
      </div>
      <div className="task-meta">
        <span>{item.timeZone}</span>
        <span>{Math.round(item.confidence * 100)}% confidence</span>
      </div>
      {item.clarification ? <p className="task-warning">{item.clarification}</p> : null}
      {error ? <p className="task-warning">{error}</p> : null}
      <div className="task-actions">
        <button
          className="primary"
          disabled={status === "saving" || (isAuthenticated && Boolean(item.clarification))}
          onClick={isAuthenticated ? onConfirm : onConnect}
        >
          {!isAuthenticated ? "Connect Google" : status === "saving" ? "Adding..." : status === "saved" ? "Added" : "Confirm & Add"}
        </button>
        <button disabled={status === "saving"}>Edit</button>
      </div>
    </div>
  );
}

function ChatHistory({
  messages,
  isLoading,
  isAuthenticated,
  onConnect,
  onConfirm,
}: {
  messages: Message[];
  isLoading: boolean;
  isAuthenticated: boolean;
  onConnect: () => void;
  onConfirm: (messageId: string, item: ParsedItem) => void;
}) {
  return (
    <section className="chat-history" aria-live="polite">
      {messages.map((message) => (
        <article key={message.id} className={`message ${message.role}`}>
          <div className="msg-bubble">
            {message.text ? <p>{message.text}</p> : null}
            {message.item ? (
              <TaskCard
                item={message.item}
                status={message.status}
                error={message.error}
                isAuthenticated={isAuthenticated}
                onConnect={onConnect}
                onConfirm={() => onConfirm(message.id, message.item as ParsedItem)}
              />
            ) : null}
          </div>
        </article>
      ))}
      {isLoading ? <TypingDots /> : null}
    </section>
  );
}

function InputPill({
  value,
  disabled,
  onChange,
  onSend,
}: {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
}) {
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") onSend();
  }

  const hasText = value.trim().length > 0;

  return (
    <div className="input-container">
      <div className="input-pill">
        <input
          value={value}
          disabled={disabled}
          placeholder="Ask Neona"
          autoComplete="off"
          aria-label="Ask Neona"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="action-cluster">
          {hasText ? (
            <button className="icon-btn mic-btn" aria-label="Send message" disabled={disabled} onClick={onSend}>
              <MaterialIcon>send</MaterialIcon>
            </button>
          ) : (
            <button className="icon-btn mic-btn" aria-label="Voice input" disabled={disabled}>
              <MaterialIcon>mic</MaterialIcon>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SchedulerChat() {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalDismissed, setIsAuthModalDismissed] = useState(false);
  const [settings, setSettings] = useState<Record<SettingKey, boolean>>({
    calendar: true,
    tasks: true,
    advanced: true,
  });
  const mainRef = useRef<HTMLElement | null>(null);
  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC", []);
  const userFirstName = firstName(session?.user?.name);
  const userName = session?.user?.name || "Neona user";

  useEffect(() => {
    mainRef.current?.scrollTo({ top: mainRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") setIsAuthModalDismissed(false);
  }, [status]);

  function resetChat() {
    setMessages([]);
    setInputValue("");
    setIsLoading(false);
    setIsSidebarOpen(false);
  }

  async function clearConnectedAccountCache() {
    if ("caches" in window) {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((key) => caches.delete(key)));
    }

    localStorage.clear();
    sessionStorage.clear();

    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
  }

  async function handleLogout() {
    setIsSidebarOpen(false);
    resetChat();
    await clearConnectedAccountCache();
    await signOut({ callbackUrl: "/" });
  }

  async function handleSend() {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    const preferredKind = settings.calendar && !settings.tasks ? "event" : settings.tasks && !settings.calendar ? "task" : undefined;
    setMessages((current) => [...current, { id: uid(), role: "user", text }]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, timezone, preferredKind }),
      });
      const payload = (await response.json()) as { item?: ParsedItem; error?: string };
      if (!response.ok || !payload.item) throw new Error(payload.error || "Could not parse that request.");

      setMessages((current) => [
        ...current,
        {
          id: uid(),
          role: "ai",
          text: "I found a schedulable item. Review it before syncing.",
          item: payload.item,
          status: "idle",
        },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected parsing error.";
      setMessages((current) => [...current, { id: uid(), role: "ai", text: message, status: "error" }]);
    } finally {
      setIsLoading(false);
    }
  }

  async function confirmSchedule(messageId: string, item: ParsedItem) {
    if (status !== "authenticated") {
      signIn("google");
      return;
    }

    setMessages((current) => current.map((message) => (message.id === messageId ? { ...message, status: "saving", error: undefined } : message)));

    try {
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item }),
      });
      const payload = (await response.json()) as { result?: { summary?: string }; error?: string };
      if (!response.ok || !payload.result) throw new Error(payload.error || "Could not add the item.");

      setMessages((current) =>
        current.map((message) =>
          message.id === messageId
            ? { ...message, status: "saved", text: `${message.text} Added ${payload.result?.summary || item.title}.` }
            : message,
        ),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected scheduling error.";
      setMessages((current) => current.map((entry) => (entry.id === messageId ? { ...entry, status: "error", error: message } : entry)));
    }
  }

  return (
    <div className="app-container">
      {status !== "authenticated" && !isAuthModalDismissed ? (
        <AuthModal status={status} onLater={() => setIsAuthModalDismissed(true)} />
      ) : null}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenSettings={() => {
          setIsSidebarOpen(false);
          setIsSettingsOpen(true);
        }}
        onNewChat={resetChat}
        isAuthenticated={status === "authenticated"}
        userName={userName}
        userEmail={session?.user?.email}
        onSignOut={status === "authenticated" ? handleLogout : () => signIn("google")}
      />
      <SettingsSheet
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onToggle={(key) => setSettings((current) => ({ ...current, [key]: !current[key] }))}
      />

      <Header onOpenSidebar={() => setIsSidebarOpen(true)} onNewChat={resetChat} />
      <main className="main-area" ref={mainRef}>
        {messages.length === 0 ? (
          <GreetingArea name={userFirstName} />
        ) : (
          <ChatHistory
            messages={messages}
            isLoading={isLoading}
            isAuthenticated={status === "authenticated"}
            onConnect={() => signIn("google")}
            onConfirm={confirmSchedule}
          />
        )}
      </main>
      <InputPill value={inputValue} disabled={isLoading} onChange={setInputValue} onSend={handleSend} />
    </div>
  );
}
