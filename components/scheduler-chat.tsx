"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent, ReactNode } from "react";
import { signIn, useSession } from "next-auth/react";
import type { ParsedItem } from "@/lib/schemas";

type Theme = "dark" | "light";
type Screen = "chat" | "settings";
type Role = "user" | "assistant";

type AttachedFile = {
  id: string;
  name: string;
  size: string;
  type: string;
};

type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  createdAt: string;
  files?: AttachedFile[];
};

type HistoryItem = {
  id: string;
  title: string;
  subtitle: string;
  kind: "event" | "task";
  createdAt: string;
};

type IconName =
  | "menu"
  | "plus"
  | "search"
  | "settings"
  | "user"
  | "paperclip"
  | "mic"
  | "send"
  | "stop"
  | "copy"
  | "refresh"
  | "edit"
  | "x"
  | "sun"
  | "moon"
  | "shield"
  | "download"
  | "spark"
  | "chevron";

const suggestions = [
  "Schedule a design review next Tuesday at 2 PM",
  "Add a task to follow up with Maya tomorrow morning",
  "Block off Friday afternoon for release prep",
  "Remind me every Monday at 9 AM to send the status update",
];

const historyStoragePrefix = "neona-google-history:";

const accentOptions = ["#10A37F", "#4F8CFF", "#F97316", "#D946EF"];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function nowLabel() {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());
}

function fileSizeLabel(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function formatDateTime(item: ParsedItem) {
  if (item.allDay) {
    return `${item.date} all day`;
  }

  const start = item.startTime ? item.startTime : "";
  const end = item.endTime && item.endTime !== item.startTime ? ` - ${item.endTime}` : "";
  return `${item.date} ${start}${end} (${item.timeZone})`;
}

function buildConfirmationMessage(item: ParsedItem, result?: { provider: "calendar" | "tasks"; summary: string }) {
  const kindLabel = item.kind === "event" ? "calendar event" : "task";
  const providerLabel = result?.provider === "tasks" ? "Google Tasks" : "Google Calendar";

  return [
    `### Added to ${providerLabel}`,
    `I understood this as a **${kindLabel}**: **${item.title}**.`,
    `When: ${formatDateTime(item)}`,
    item.description ? `Details: ${item.description}` : null,
    result?.summary ? `Saved as: ${result.summary}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildClarificationMessage(item: ParsedItem) {
  const prompt = item.clarification ?? "I need one more detail before I can create this item.";
  return [`### I need one detail`, prompt, item.description ? `I understood: ${item.title}` : null].filter(Boolean).join("\n\n");
}

function groupHistoryItems(items: HistoryItem[]) {
  const groups = new Map<string, HistoryItem[]>();
  const now = Date.now();

  for (const item of items) {
    const age = now - new Date(item.createdAt).getTime();
    const label = age < 24 * 60 * 60 * 1000 ? "Today" : age < 48 * 60 * 60 * 1000 ? "Yesterday" : "Previous 7 days";
    const bucket = groups.get(label) ?? [];
    bucket.push(item);
    groups.set(label, bucket);
  }

  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    plus: <path d="M12 5v14M5 12h14" />,
    search: <path d="m21 21-4.4-4.4M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z" />,
    settings: <path d="M12 15.4a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8ZM19.4 15a8.4 8.4 0 0 0 .1-1l2-1.5-2-3.5-2.4 1a8.6 8.6 0 0 0-1.7-1l-.3-2.6H9l-.3 2.6c-.6.3-1.2.6-1.7 1l-2.4-1-2 3.5 2 1.5a8.4 8.4 0 0 0 .1 2l-2 1.5 2 3.5 2.4-1c.5.4 1.1.7 1.7 1l.3 2.6h6.1l.3-2.6c.6-.3 1.2-.6 1.7-1l2.4 1 2-3.5-2.2-1.5Z" />,
    user: <path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />,
    paperclip: <path d="m21 8.5-9.8 9.8a5 5 0 0 1-7.1-7.1l9.2-9.2a3.4 3.4 0 1 1 4.8 4.8L8.8 16a1.8 1.8 0 0 1-2.5-2.5l8.6-8.6" />,
    mic: <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3ZM5 11a7 7 0 0 0 14 0M12 18v4" />,
    send: <path d="m22 2-7 20-4-9-9-4 20-7ZM11 13l11-11" />,
    stop: <path d="M8 8h8v8H8z" />,
    copy: <path d="M8 8h11v13H8zM5 16H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v1" />,
    refresh: <path d="M21 12a9 9 0 0 1-15.3 6.4L3 16M3 21v-5h5M3 12A9 9 0 0 1 18.3 5.6L21 8M21 3v5h-5" />,
    edit: <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    sun: <path d="M12 4V2M12 22v-2M4 12H2M22 12h-2M5 5l-1.4-1.4M20.4 20.4 19 19M19 5l1.4-1.4M3.6 20.4 5 19M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />,
    moon: <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5Z" />,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
    download: <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />,
    spark: <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2ZM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" />,
    chevron: <path d="m9 18 6-6-6-6" />,
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="icon">
      {paths[name]}
    </svg>
  );
}

function IconButton({
  label,
  icon,
  onClick,
  className = "",
  disabled,
  type = "button",
}: {
  label: string;
  icon: IconName;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button className={`icon-button ${className}`} aria-label={label} title={label} onClick={onClick} disabled={disabled} type={type}>
      <Icon name={icon} />
    </button>
  );
}

function LogoMark() {
  return (
    <div className="logo-mark" aria-hidden="true">
      <Icon name="spark" />
    </div>
  );
}

function renderInline(text: string, keyPrefix: string) {
  const chunks = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\$[^$]+\$)/g).filter(Boolean);

  return chunks.map((chunk, index) => {
    const key = `${keyPrefix}-${index}`;
    if (chunk.startsWith("`") && chunk.endsWith("`")) return <code key={key}>{chunk.slice(1, -1)}</code>;
    if (chunk.startsWith("**") && chunk.endsWith("**")) return <strong key={key}>{chunk.slice(2, -2)}</strong>;
    if (chunk.startsWith("$") && chunk.endsWith("$")) return <span key={key} className="math-chip">{chunk.slice(1, -1)}</span>;
    return <span key={key}>{chunk}</span>;
  });
}

function SyntaxCode({ code }: { code: string }) {
  return (
    <>
      {code.split(/(\b(?:const|let|type|return|if|else|true|false|string|number)\b|"[^"]*"|'[^']*'|\/\/.*)/g).map((part, index) => {
        if (/^(const|let|type|return|if|else|true|false|string|number)$/.test(part)) return <span key={index} className="token keyword">{part}</span>;
        if (/^["']/.test(part)) return <span key={index} className="token string">{part}</span>;
        if (part.startsWith("//")) return <span key={index} className="token comment">{part}</span>;
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

function Markdown({ content, onCopy }: { content: string; onCopy: (value: string) => void }) {
  const lines = content.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const language = line.slice(3).trim() || "text";
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1;
      const code = codeLines.join("\n");
      blocks.push(
        <div className="code-card" key={`code-${i}`}>
          <div className="code-toolbar">
            <span>{language}</span>
            <IconButton label="Copy code" icon="copy" onClick={() => onCopy(code)} />
          </div>
          <pre>
            <code>
              <SyntaxCode code={code} />
            </code>
          </pre>
        </div>,
      );
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const Tag = (`h${level}` as "h1" | "h2" | "h3");
      blocks.push(<Tag key={`heading-${i}`}>{renderInline(heading[2], `heading-${i}`)}</Tag>);
      i += 1;
      continue;
    }

    if (line.includes("|") && i + 1 < lines.length && /^[\s|:-]+$/.test(lines[i + 1])) {
      const rows: string[][] = [];
      rows.push(line.split("|").map((cell) => cell.trim()).filter(Boolean));
      i += 2;
      while (i < lines.length && lines[i].includes("|")) {
        rows.push(lines[i].split("|").map((cell) => cell.trim()).filter(Boolean));
        i += 1;
      }
      const [head, ...body] = rows;
      blocks.push(
        <div className="table-wrap" key={`table-${i}`}>
          <table>
            <thead>
              <tr>{head.map((cell) => <th key={cell}>{cell}</th>)}</tr>
            </thead>
            <tbody>
              {body.map((row, rowIndex) => (
                <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`}>{renderInline(cell, `td-${rowIndex}-${cellIndex}`)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i += 1;
      }
      blocks.push(<ul key={`ul-${i}`}>{items.map((item, index) => <li key={index}>{renderInline(item, `ul-${i}-${index}`)}</li>)}</ul>);
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i += 1;
      }
      blocks.push(<ol key={`ol-${i}`}>{items.map((item, index) => <li key={index}>{renderInline(item, `ol-${i}-${index}`)}</li>)}</ol>);
      continue;
    }

    const paragraph: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith("```") &&
      !/^(#{1,3})\s+/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      paragraph.push(lines[i]);
      i += 1;
    }
    blocks.push(<p key={`p-${i}`}>{renderInline(paragraph.join(" "), `p-${i}`)}</p>);
  }

  return <div className="markdown">{blocks}</div>;
}

export default function SchedulerChat() {
  const { data: session } = useSession();
  const [theme, setTheme] = useState<Theme>("dark");
  const [accent, setAccent] = useState(accentOptions[0]);
  const [screen, setScreen] = useState<Screen>("chat");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const googleConnected = Boolean(session?.accessToken);

  const groupedHistory = useMemo(() => {
    const term = query.trim().toLowerCase();
    return groupHistoryItems(historyItems)
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          const haystack = `${item.title} ${item.subtitle}`.toLowerCase();
          return !term || haystack.includes(term);
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [historyItems, query]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.setProperty("--accent", accent);
  }, [theme, accent]);

  useEffect(() => {
    if (messages.length <= 1 && !isGenerating) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isGenerating]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    return () => {
      requestRef.current?.abort();
    };
  }, []);

  async function refreshHistory() {
    if (!googleConnected) {
      setHistoryItems([]);
      return;
    }

    setHistoryLoading(true);
    try {
      const response = await fetch("/api/history", { cache: "no-store" });
      const payload = (await response.json()) as { items?: HistoryItem[]; error?: string };

      if (!response.ok || !payload.items) {
        throw new Error(payload.error ?? "Unable to load history.");
      }

      setHistoryItems(payload.items);
    } catch {
      setHistoryItems([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    void refreshHistory();
  }, [googleConnected, session?.user?.email]);

  function stopGenerating() {
    requestRef.current?.abort();
    requestRef.current = null;
    setIsGenerating(false);
  }

  async function runScheduleFlow(prompt: string) {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setIsGenerating(true);

    try {
      const parseResponse = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: prompt, timezone: getTimeZone() }),
        signal: controller.signal,
      });

      const parsed = (await parseResponse.json()) as { item?: ParsedItem; error?: string };
      if (!parseResponse.ok || !parsed.item) {
        throw new Error(parsed.error ?? "Unable to understand the request.");
      }

      const item = parsed.item;

      if (item.clarification) {
        setMessages((current) => [
          ...current,
          {
            id: uid(),
            role: "assistant",
            content: buildClarificationMessage(item),
            createdAt: nowLabel(),
          },
        ]);
        return;
      }

      if (!googleConnected) {
        setMessages((current) => [
          ...current,
          {
            id: uid(),
            role: "assistant",
            content: `${buildConfirmationMessage(item)}\n\nConnect Google in Settings, then send this again and I will create it automatically.`,
            createdAt: nowLabel(),
          },
        ]);
        return;
      }

      const scheduleResponse = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: parsed.item }),
        signal: controller.signal,
      });

      const scheduled = (await scheduleResponse.json()) as { result?: { provider: "calendar" | "tasks"; summary: string }; error?: string };
      if (!scheduleResponse.ok || !scheduled.result) {
        throw new Error(scheduled.error ?? "Unable to create the item.");
      }

      setMessages((current) => [
        ...current,
        {
          id: uid(),
          role: "assistant",
          content: buildConfirmationMessage(item, scheduled.result),
          createdAt: nowLabel(),
        },
      ]);

      void refreshHistory();
    } catch (error) {
      if ((error as DOMException)?.name === "AbortError") return;

      setMessages((current) => [
        ...current,
        {
          id: uid(),
          role: "assistant",
          content: error instanceof Error ? error.message : "I could not process that request.",
          createdAt: nowLabel(),
        },
      ]);
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
      }
      setIsGenerating(false);
    }
  }

  function submitPrompt(text = input) {
    const prompt = text.trim();
    if (!prompt || isGenerating) return;

    if (editingId) {
      setMessages((current) => current.map((message) => (message.id === editingId ? { ...message, content: prompt, createdAt: nowLabel() } : message)));
      setEditingId(null);
    } else {
      setMessages((current) => [
        ...current,
        {
          id: uid(),
          role: "user",
          content: prompt,
          files,
          createdAt: nowLabel(),
        },
      ]);
    }

    setInput("");
    setFiles([]);
    void runScheduleFlow(prompt);
  }

  function regenerate() {
    if (isGenerating) return;
    const lastUser = [...messages].reverse().find((message) => message.role === "user");
    if (!lastUser) return;
    setMessages((current) => {
      const next = [...current];
      if (next[next.length - 1]?.role === "assistant") next.pop();
      return next;
    });
    void runScheduleFlow(lastUser.content);
  }

  function editMessage(message: ChatMessage) {
    if (isGenerating || message.role !== "user") return;
    setEditingId(message.id);
    setInput(message.content);
  }

  async function copyText(value: string) {
    await navigator.clipboard.writeText(value);
    setCopied("Copied");
    window.setTimeout(() => setCopied(null), 1300);
  }

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []).map((file) => ({
      id: uid(),
      name: file.name,
      size: fileSizeLabel(file.size),
      type: file.type || "file",
    }));
    setFiles((current) => [...current, ...selected]);
    event.target.value = "";
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitPrompt();
    }
    if (event.key === "Escape") {
      setEditingId(null);
      setInput("");
    }
  }

  function newChat() {
    requestRef.current?.abort();
    requestRef.current = null;
    setIsGenerating(false);
    setMessages([]);
    setInput("");
    setFiles([]);
    setScreen("chat");
    setDrawerOpen(false);
  }

  const hasTyped = input.trim().length > 0;

  return (
    <div className="app-shell">
      <div className="splash" aria-hidden="true">
        <LogoMark />
        <strong>Neona</strong>
      </div>

      <button className="drawer-backdrop" data-open={drawerOpen} aria-label="Close menu" onClick={() => setDrawerOpen(false)} />

      <aside className="sidebar" data-open={drawerOpen}>
        <div className="sidebar-top">
          <div className="brand-lockup">
            <LogoMark />
            <span>Neona</span>
          </div>
          <IconButton label="Close menu" icon="x" onClick={() => setDrawerOpen(false)} className="mobile-only" />
        </div>

        <button className="wide-action" onClick={newChat}>
          <Icon name="plus" />
          <span>New chat</span>
        </button>

        <label className="search-field">
          <Icon name="search" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search chats" aria-label="Search chats" />
        </label>

        <nav className="history-list" aria-label="Google history">
          <section>
            <h2>{googleConnected ? "Based on your Google account" : "Connect Google to load history"}</h2>
            {googleConnected && historyLoading ? (
              <p className="history-empty">Loading Google history...</p>
            ) : googleConnected && groupedHistory.length ? (
              groupedHistory.map((group) => (
                <div key={group.label}>
                  <h3>{group.label}</h3>
                  {group.items.map((item) => (
                    <button key={item.id} onClick={() => setDrawerOpen(false)} className="history-item">
                      <span>{item.title}</span>
                      <small>{item.subtitle}</small>
                    </button>
                  ))}
                </div>
              ))
            ) : googleConnected ? (
              <p className="history-empty">No Google history yet. Create an event or task to see it here.</p>
            ) : (
              <p className="history-empty">Connect Google in Settings to show recent items.</p>
            )}
          </section>
        </nav>

        <div className="sidebar-footer">
          <button className="footer-row" onClick={() => setScreen("settings")}>
            <Icon name="settings" />
            <span>Settings</span>
            <Icon name="chevron" />
          </button>
          <button className="footer-row">
            <span className="avatar">N</span>
            <span>Neona Studio</span>
            <span
              className="status-dot"
              data-connected={String(googleConnected)}
              title={googleConnected ? "Google connected" : "Google not connected"}
            />
          </button>
        </div>
      </aside>

      <main className="main-pane">
        <header className="topbar">
          <IconButton label="Open menu" icon="menu" onClick={() => setDrawerOpen(true)} className="desktop-hidden" />
          <button className="topbar-brand" onClick={() => setScreen("chat")} aria-label="Open chat">
            <LogoMark />
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              Neona
              <span
                className="status-dot"
                data-connected={String(googleConnected)}
                title={googleConnected ? "Google connected" : "Google not connected"}
                aria-label={googleConnected ? "Google connected" : "Google not connected"}
              />
            </span>
          </button>
          <div className="topbar-actions">
            <IconButton label="New chat" icon="plus" onClick={newChat} />
            <IconButton label="Settings" icon="settings" onClick={() => setScreen("settings")} />
          </div>
        </header>

        {screen === "settings" ? (
          <section className="settings-view" aria-label="Settings">
            <div className="settings-header">
              <button className="back-button" onClick={() => setScreen("chat")}>
                <Icon name="chevron" />
                <span>Chat</span>
              </button>
              <h1>Settings</h1>
            </div>

            <div className="profile-card">
              <span className="profile-avatar">N</span>
              <div>
                <h2>Neona Studio</h2>
                <p>Premium local chat experience</p>
              </div>
            </div>

            <section className="settings-card">
              <div>
                <h2>Appearance</h2>
                <p>Choose the interface mode and accent.</p>
              </div>
              <div className="segmented" role="group" aria-label="Theme">
                <button className={theme === "dark" ? "active" : ""} onClick={() => setTheme("dark")}>
                  <Icon name="moon" />
                  <span>Dark</span>
                </button>
                <button className={theme === "light" ? "active" : ""} onClick={() => setTheme("light")}>
                  <Icon name="sun" />
                  <span>Light</span>
                </button>
              </div>
              <div className="swatches" aria-label="Accent color picker">
                {accentOptions.map((color) => (
                  <button
                    key={color}
                    className={accent === color ? "selected" : ""}
                    style={{ backgroundColor: color }}
                    aria-label={`Set accent ${color}`}
                    onClick={() => setAccent(color)}
                  />
                ))}
              </div>
            </section>

            <section className="settings-card">
              <div>
                <h2>Data Controls</h2>
                <p>Manage local cache and exported conversations.</p>
              </div>
              <button
                className="settings-row"
                onClick={() => {
                  try {
                    const origin = typeof window !== "undefined" ? window.location.origin : "";
                    void signIn("google", { callbackUrl: `${origin}/auth/connected` });
                  } catch {
                    void signIn("google");
                  }
                }}
                disabled={googleConnected}
              >
                <Icon name="user" />
                <span style={{ flex: 1 }}>{googleConnected ? "Google connected" : "Connect Google"}</span>
                <span
                  className="status-dot"
                  data-connected={String(googleConnected)}
                  title={googleConnected ? "Google connected" : "Not connected"}
                />
              </button>
              <button className="settings-row">
                <Icon name="download" />
                <span>Export conversations</span>
              </button>
              <button className="settings-row">
                <Icon name="shield" />
                <span>Clear offline cache</span>
              </button>
            </section>

            <section className="settings-card">
              <div>
                <h2>About</h2>
                <p>Neona AI interface, version 1.0.0.</p>
              </div>
            </section>
          </section>
        ) : (
          <section className="chat-view" aria-label="Chat">
            <div className="messages-viewport" ref={scrollRef}>
              {messages.length <= 1 ? (
                <section className="home-panel">
                  <LogoMark />
                  <h1>How can I help?</h1>
                  <div className="suggestion-grid">
                    {suggestions.map((suggestion) => (
                      <button key={suggestion} className="suggestion-card" onClick={() => submitPrompt(suggestion)}>
                        <span>{suggestion}</span>
                        <Icon name="chevron" />
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              <div className="conversation" aria-live="polite">
                {messages.map((message) => (
                  <article key={message.id} className={`message-row ${message.role}`}>
                    {message.role === "assistant" ? (
                      <div className="assistant-mark">
                        <LogoMark />
                      </div>
                    ) : null}
                    <div className="message-stack">
                      <div className="message-meta">
                        <span>{message.role === "assistant" ? "Neona" : "You"}</span>
                        <time>{message.createdAt}</time>
                      </div>
                      <div className="chat-bubble">
                        {message.files?.length ? (
                          <div className="file-strip">
                            {message.files.map((file) => (
                              <span key={file.id}>{file.name}</span>
                            ))}
                          </div>
                        ) : null}
                        <Markdown content={message.content} onCopy={copyText} />
                      </div>
                      <div className="message-actions">
                        <IconButton label="Copy message" icon="copy" onClick={() => copyText(message.content)} />
                        {message.role === "user" ? <IconButton label="Edit message" icon="edit" onClick={() => editMessage(message)} /> : null}
                      </div>
                    </div>
                  </article>
                ))}

                {isGenerating ? (
                  <div className="typing-row">
                    <span />
                    <span />
                    <span />
                  </div>
                ) : null}
              </div>
            </div>

            <footer className="composer-wrap">
              {copied ? <div className="toast">{copied}</div> : null}
              {isVoiceOpen ? (
                <div className="voice-panel">
                  <span className="voice-orb" />
                  <p>Listening mode ready</p>
                  <IconButton label="Close voice input" icon="x" onClick={() => setIsVoiceOpen(false)} />
                </div>
              ) : null}
              {files.length ? (
                <div className="upload-strip">
                  {files.map((file) => (
                    <span key={file.id}>
                      {file.name}
                      <small>{file.size}</small>
                    </span>
                  ))}
                </div>
              ) : null}
              {hasTyped ? (
                <div className="live-preview">
                  <span>Preview</span>
                  <Markdown content={input} onCopy={copyText} />
                </div>
              ) : null}
              <form className="composer" onSubmit={(event) => { event.preventDefault(); submitPrompt(); }}>
                <input ref={fileInputRef} type="file" multiple className="visually-hidden" onChange={handleFiles} />
                <IconButton label="Attach files" icon="paperclip" onClick={() => fileInputRef.current?.click()} />
                <textarea
                  value={input}
                  rows={1}
                  placeholder={editingId ? "Edit your message" : "Message Neona"}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  aria-label="Message Neona"
                />
                <IconButton label="Voice input" icon="mic" onClick={() => setIsVoiceOpen((value) => !value)} />
                {isGenerating ? (
                  <IconButton label="Stop generating" icon="stop" onClick={stopGenerating} className="send-button" />
                ) : hasTyped ? (
                  <IconButton label="Send message" icon="send" className="send-button" type="submit" />
                ) : (
                  <IconButton label="Regenerate response" icon="refresh" onClick={regenerate} disabled={!messages.some((message) => message.role === "user")} />
                )}
              </form>
            </footer>
          </section>
        )}
      </main>
    </div>
  );
}
