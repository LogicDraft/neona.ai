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
type PreferredKind = "event" | "task";

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

function formatReadableRecurrence(rrule: string): string {
  if (rrule.includes("FREQ=DAILY")) return "Daily";
  if (rrule.includes("FREQ=WEEKLY")) {
    const byday = rrule.match(/BYDAY=([A-Z,]+)/)?.[1];
    if (byday) {
      const days: Record<string, string> = { SU: "Sunday", MO: "Monday", TU: "Tuesday", WE: "Wednesday", TH: "Thursday", FR: "Friday", SA: "Saturday" };
      const dayList = byday.split(",").map(d => days[d] || d).join(", ");
      return `Weekly on ${dayList}`;
    }
    return "Weekly";
  }
  if (rrule.includes("FREQ=MONTHLY")) return "Monthly";
  if (rrule.includes("FREQ=YEARLY")) return "Yearly";
  return rrule;
}

function confidenceState(item: ParsedItem) {
  if (item.clarification) return { label: "Ambiguous time", className: "warn", icon: "help" };
  if (!item.date || (!item.allDay && !item.startTime)) return { label: "Needs date", className: "needs", icon: "event_busy" };
  if (item.confidence >= 0.78) return { label: "Looks good", className: "good", icon: "check_circle" };
  return { label: "Needs review", className: "needs", icon: "rate_review" };
}

function MaterialIcon({ children, className = "", style }: { children: string; className?: string; style?: React.CSSProperties }) {
  return <span className={`material-symbols-outlined ${className}`} style={style}>{children}</span>;
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
  status,
  userName,
  userEmail,
  onSignOut,
  onInstall,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onNewChat: () => void;
  status: "loading" | "authenticated" | "unauthenticated";
  userName: string;
  userEmail?: string | null;
  onSignOut: () => void;
  onInstall?: () => void;
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
          
          <div style={{ marginTop: "auto", padding: "16px 8px 0", fontSize: "11px", color: "var(--text-muted)", textAlign: "center" }}>
            Developed by <a href="https://github.com/LogicDraft" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary-light)", textDecoration: "none" }}>LogicDraft</a>
          </div>
        </div>
        <div className="sidebar-footer">
          {status === "loading" ? (
            <div style={{ display: "flex", gap: "12px", alignItems: "center", width: "100%" }}>
              <div className="profile-pic skeleton" />
              <div style={{ flex: 1, height: "14px", borderRadius: "4px" }} className="skeleton" />
            </div>
          ) : (
            <>
              <div className="profile-pic" aria-hidden="true" />
              <div className="profile-info">
                <span className="profile-name">{userName}</span>
                <span className="profile-tier">{status === "authenticated" ? userEmail || "Google connected" : "Connect Google when ready"}</span>
              </div>
              {onInstall && (
                <button className="footer-settings" aria-label="Install App" onClick={onInstall}>
                  <MaterialIcon>download</MaterialIcon>
                </button>
              )}
              <button className="footer-settings" aria-label={status === "authenticated" ? "Sign out" : "Sign in"} onClick={onSignOut}>
                <MaterialIcon>{status === "authenticated" ? "logout" : "login"}</MaterialIcon>
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

function SettingsSheet({
  isOpen,
  settings,
  isAuthenticated,
  userEmail,
  onToggle,
  onClose,
  onClearChat,
  onClearCache,
  onDisconnect,
}: {
  isOpen: boolean;
  settings: Record<SettingKey, boolean>;
  isAuthenticated: boolean;
  userEmail?: string | null;
  onToggle: (key: SettingKey) => void;
  onClose: () => void;
  onClearChat: () => void;
  onClearCache: () => void;
  onDisconnect: () => void;
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
        <div className="connected-status">
          <MaterialIcon>{isAuthenticated ? "cloud_done" : "cloud_off"}</MaterialIcon>
          <span>
            {isAuthenticated ? "Connected as" : "Google not connected"}
            <strong>{isAuthenticated ? userEmail || "Google account" : "Sign in when you want to sync"}</strong>
          </span>
        </div>
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
        <div style={{ marginTop: "24px" }}>
          <h3 style={{ fontSize: "16px", marginBottom: "12px", color: "var(--text-secondary)" }}>Privacy & Data</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button className="setting-item" onClick={onClearChat}>
              <span>Clear chat history</span>
              <MaterialIcon className="small-icon">delete</MaterialIcon>
            </button>
            <button className="setting-item" onClick={onClearCache}>
              <span>Clear local cache</span>
              <MaterialIcon className="small-icon">cleaning_services</MaterialIcon>
            </button>
            {isAuthenticated && (
              <button className="setting-item" onClick={onDisconnect}>
                <span style={{ color: "#f2b8b5" }}>Disconnect Google</span>
                <MaterialIcon className="small-icon" style={{ color: "#f2b8b5" }}>link_off</MaterialIcon>
              </button>
            )}
          </div>
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
        <div className="auth-desc" style={{ textAlign: "left", display: "inline-block" }}>
          We only request access to:
          <ul style={{ paddingLeft: "20px", marginTop: "8px", marginBottom: "12px", color: "var(--text-primary)" }}>
            <li>📅 View & Add Calendar Events</li>
            <li>✅ View & Add Google Tasks</li>
          </ul>
          <div style={{ fontSize: "13px", color: "var(--text-muted)", display: "flex", alignItems: "start", gap: "6px" }}>
            <MaterialIcon className="tiny-icon">lock</MaterialIcon>
            Your tokens stay secure and your requests are not permanently stored on our servers.
          </div>
        </div>
        <button className="btn-full btn-google" style={{ marginTop: "16px" }} disabled={status === "loading"} onClick={() => signIn("google")}>
          {status === "loading" ? "Checking session..." : "Sign in with Google"}
        </button>
        <button className="btn-full btn-later" disabled={status === "loading"} onClick={onLater}>
          Maybe later
        </button>
      </div>
    </div>
  );
}

function GreetingArea({ name, justLoggedIn }: { name: string; justLoggedIn?: boolean }) {
  return (
    <section className="greeting-container" aria-label="Greeting">
      <img src="/app_icon.png" alt="Neona App Icon" className={`app-icon-greeting ${justLoggedIn ? "login-bounce" : "real-icon"}`} />
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

function ReviewField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="review-field">
      <span>{label}</span>
      {children}
    </label>
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
  onConfirm: (item: ParsedItem) => void;
  onConnect: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<ParsedItem>(item);
  const confidence = confidenceState(draft);

  useEffect(() => {
    setDraft(item);
  }, [item]);

  function updateDraft(patch: Partial<ParsedItem>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  return (
    <div className={`task-card ${status === "saved" ? "success-pop" : "pop-in"}`}>
      <div className="task-header">
        <MaterialIcon className="small-icon">auto_awesome</MaterialIcon>
        Google {draft.kind === "event" ? "Event" : "Task"} Parsed
      </div>
      <div className={`confidence-pill ${confidence.className}`}>
        <MaterialIcon className="tiny-icon">{confidence.icon}</MaterialIcon>
        <span>{confidence.label}</span>
        <small>{Math.round(draft.confidence * 100)}%</small>
      </div>
      {isEditing ? (
        <div className="review-grid">
          <ReviewField label="Title">
            <input value={draft.title} onChange={(event) => updateDraft({ title: event.target.value })} />
          </ReviewField>
          <ReviewField label="Date">
            <input type="date" value={draft.date} onChange={(event) => updateDraft({ date: event.target.value })} />
          </ReviewField>
          <ReviewField label="Time">
            <input
              type="time"
              value={draft.startTime || ""}
              onChange={(event) => updateDraft({ startTime: event.target.value || null, allDay: !event.target.value })}
            />
          </ReviewField>
          <ReviewField label="Type">
            <select value={draft.kind} onChange={(event) => updateDraft({ kind: event.target.value as PreferredKind })}>
              <option value="event">Calendar event</option>
              <option value="task">Google task</option>
            </select>
          </ReviewField>
        </div>
      ) : (
        <>
          <div className="task-title">{draft.title}</div>
          {draft.description ? <p className="task-desc">{draft.description}</p> : null}
          <div className="task-time">
            <MaterialIcon className="tiny-icon">event</MaterialIcon>
            {formatTaskTime(draft)}
          </div>
          {draft.recurrence && (
            <div className="task-time">
              <MaterialIcon className="tiny-icon">repeat</MaterialIcon>
              <span>Repeats: {formatReadableRecurrence(draft.recurrence)}</span>
            </div>
          )}
        </>
      )}
      <div className="task-meta">
        <span>{draft.timeZone}</span>
        <span>{draft.kind === "event" ? "Calendar" : "Tasks"}</span>
      </div>
      {draft.clarification ? <p className="task-warning">{draft.clarification}</p> : null}
      {error ? <p className="task-warning">{error}</p> : null}
      <div className="task-actions">
        <button
          className="primary"
          disabled={status === "saving" || (isAuthenticated && Boolean(draft.clarification))}
          onClick={isAuthenticated ? () => onConfirm(draft) : onConnect}
        >
          {!isAuthenticated ? "Connect Google" : status === "saving" ? "Adding (Syncing)..." : status === "saved" ? "Added" : status === "error" ? "Sync Failed - Retry" : "Confirm & Add"}
        </button>
        <button disabled={status === "saving"} onClick={() => setIsEditing((current) => !current)}>
          {isEditing ? "Done reviewing" : "Review"}
        </button>
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
          {message.role === "ai" && (
            <div className="ai-avatar">
              <img src="/app_icon.png" alt="Neona AI" />
            </div>
          )}
          <div className="msg-bubble">
            {message.text ? <p>{message.text}</p> : null}
            {message.item ? (
              <TaskCard
                item={message.item}
                status={message.status}
                error={message.error}
                isAuthenticated={isAuthenticated}
                onConnect={onConnect}
                onConfirm={(draft) => onConfirm(message.id, draft)}
              />
            ) : null}
          </div>
        </article>
      ))}
      {isLoading ? (
        <article className="message ai">
          <div className="ai-avatar pulse">
            <img src="/app_icon.png" alt="Neona AI" />
          </div>
          <div className="msg-bubble">
            <TypingDots />
          </div>
        </article>
      ) : null}
    </section>
  );
}

function InputPill({
  value,
  disabled,
  selectedKind,
  onChange,
  onSend,
  onKindChange,
  onChip,
  inputRef,
  isListening,
  onMicClick,
}: {
  value: string;
  disabled: boolean;
  selectedKind: PreferredKind;
  onChange: (value: string) => void;
  onSend: () => void;
  onKindChange: (kind: PreferredKind) => void;
  onChip: (text: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  isListening?: boolean;
  onMicClick?: () => void;
}) {
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") onSend();
  }

  const hasText = value.trim().length > 0;
  const chips = ["Tomorrow", "Next week", "Add reminder", "Make recurring"];

  return (
    <div className="input-container">
      <div className="quick-chips" aria-label="Quick prompts">
        {chips.map((chip) => (
          <button key={chip} onClick={() => onChip(chip)}>
            {chip}
          </button>
        ))}
      </div>
      <div className="kind-switch" role="group" aria-label="Choose sync type">
        <button className={selectedKind === "event" ? "active" : ""} onClick={() => onKindChange("event")}>
          <MaterialIcon className="tiny-icon">event</MaterialIcon>
          Calendar
        </button>
        <button className={selectedKind === "task" ? "active" : ""} onClick={() => onKindChange("task")}>
          <MaterialIcon className="tiny-icon">task_alt</MaterialIcon>
          Tasks
        </button>
      </div>
      <div className="input-pill">
        <input
          ref={inputRef}
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
            <button className={`icon-btn mic-btn ${isListening ? "listening" : ""}`} aria-label="Voice input" disabled={disabled} onClick={onMicClick}>
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalDismissed, setIsAuthModalDismissed] = useState(false);
  const [selectedKind, setSelectedKind] = useState<PreferredKind>("event");
  const [settings, setSettings] = useState<Record<SettingKey, boolean>>({
    calendar: true,
    tasks: true,
    advanced: true,
  });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
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
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsSidebarOpen(false);
        setIsSettingsOpen(false);
      } else if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown as any);
    return () => window.removeEventListener("keydown", handleKeyDown as any);
  }, []);

  useEffect(() => {
    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e);
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  useEffect(() => {
    if (status === "authenticated") setIsAuthModalDismissed(false);
  }, [status]);

  useEffect(() => {
    const stored = localStorage.getItem("neona_chat_history");
    if (stored) {
      try { setMessages(JSON.parse(stored)); } catch(e) {}
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("neona_chat_history", JSON.stringify(messages));
    }
  }, [messages, isLoaded]);

  function resetChat() {
    setMessages([]);
    setInputValue("");
    setIsLoading(false);
    setIsSidebarOpen(false);
  }

  function applyQuickChip(text: string) {
    setInputValue((current) => {
      const trimmed = current.trim();
      if (!trimmed) return text;
      return `${trimmed} ${text.toLowerCase()}`;
    });
  }

  async function clearLocalCache() {
    if ("caches" in window) {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((key) => caches.delete(key)));
    }
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
    alert("Local cache cleared.");
  }

  function clearChat() {
    localStorage.removeItem("neona_chat_history");
    sessionStorage.clear();
    resetChat();
    alert("Chat history cleared.");
  }

  function toggleListening() {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice input.");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      let finalTranscript = "";

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setInputValue(finalTranscript + interimTranscript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }

    setInputValue("");
    recognitionRef.current.start();
    setIsListening(true);
  }

  async function handleLogout() {
    setIsSidebarOpen(false);
    setIsSettingsOpen(false);
    clearChat();
    await clearLocalCache();
    await signOut({ callbackUrl: "/" });
  }

  async function handleSend() {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    const preferredKind = selectedKind;
    setMessages((current) => [...current, { id: uid(), role: "user", text }]);
    setInputValue("");
    
    if (!navigator.onLine) {
      setMessages((current) => [...current, { id: uid(), role: "ai", text: "You're offline. Draft saved locally." }]);
      return;
    }

    setIsLoading(true);

    try {
      const history = [...messages, { role: "user" as const, text, item: undefined }].map(msg => ({ role: msg.role, text: msg.text, item: msg.item }));
      const response = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, timezone, preferredKind, history }),
      });
      const payload = (await response.json()) as { item?: ParsedItem; error?: string };
      if (!response.ok || !payload.item) throw new Error(payload.error || "Could not parse that request.");

      setMessages((currentMessages) => {
        const isWeakCard = payload.item!.confidence < 0.65 || Boolean(payload.item!.clarification);
        return [
          ...currentMessages,
          {
            id: uid(),
            role: "ai",
            text: isWeakCard ? payload.item!.clarification || "Could you clarify that?" : "I found a schedulable item. Review it before syncing.",
            item: isWeakCard ? undefined : payload.item,
            status: "idle",
          },
        ];
      });
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

    setMessages((current) => current.map((message) => (message.id === messageId ? { ...message, item, status: "saving", error: undefined } : message)));

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
        status={status}
        userName={userName}
        userEmail={session?.user?.email}
        onSignOut={status === "authenticated" ? handleLogout : () => signIn("google")}
        onInstall={
          deferredPrompt
            ? async () => {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === "accepted") setDeferredPrompt(null);
              }
            : undefined
        }
      />
      <SettingsSheet
        isOpen={isSettingsOpen}
        settings={settings}
        isAuthenticated={status === "authenticated"}
        userEmail={session?.user?.email}
        onClose={() => setIsSettingsOpen(false)}
        onToggle={(key) => setSettings((current) => ({ ...current, [key]: !current[key] }))}
        onClearChat={clearChat}
        onClearCache={clearLocalCache}
        onDisconnect={handleLogout}
      />

      <Header onOpenSidebar={() => setIsSidebarOpen(true)} onNewChat={resetChat} />
      <main className="main-area" ref={mainRef}>
        {messages.length === 0 ? (
          <GreetingArea name={userFirstName} justLoggedIn={status === "authenticated" && !isLoaded} />
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
      <InputPill
        value={inputValue}
        disabled={isLoading}
        selectedKind={selectedKind}
        onChange={setInputValue}
        onKindChange={setSelectedKind}
        onChip={applyQuickChip}
        onSend={handleSend}
        inputRef={inputRef}
        isListening={isListening}
        onMicClick={toggleListening}
      />
    </div>
  );
}
