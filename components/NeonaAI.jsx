"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { signIn, useSession } from "next-auth/react";

const THEME = {
  dark: {
    bg: "#080B14",
    surface: "#0D1120",
    surfaceAlt: "#111827",
    border: "rgba(99,179,237,0.08)",
    borderGlow: "rgba(99,179,237,0.22)",
    text: "#E8F0FE",
    textMuted: "#6B7A99",
    textSoft: "#9DADC8",
    accent: "#4F9EFF",
    accentSoft: "rgba(79,158,255,0.12)",
    accentGlow: "rgba(79,158,255,0.3)",
    cyan: "#00D4FF",
    cyanSoft: "rgba(0,212,255,0.1)",
    green: "#00E5A0",
    greenSoft: "rgba(0,229,160,0.1)",
    purple: "#9D6FFF",
    purpleSoft: "rgba(157,111,255,0.1)",
    userBubble: "linear-gradient(135deg,#1E3A5F,#1A2F50)",
    aiBubble: "#0F1829",
    shadow: "0 8px 40px rgba(0,0,0,0.5)",
    scrollbar: "#1E2840",
    inputBg: "#0D1120",
    navBg: "rgba(8,11,20,0.9)",
  },
  light: {
    bg: "#F0F4FF",
    surface: "#FFFFFF",
    surfaceAlt: "#F7F9FF",
    border: "rgba(79,158,255,0.15)",
    borderGlow: "rgba(79,158,255,0.35)",
    text: "#0D1427",
    textMuted: "#8A97B0",
    textSoft: "#5A6785",
    accent: "#2B7FFF",
    accentSoft: "rgba(43,127,255,0.1)",
    accentGlow: "rgba(43,127,255,0.25)",
    cyan: "#0099CC",
    cyanSoft: "rgba(0,153,204,0.08)",
    green: "#00B87A",
    greenSoft: "rgba(0,184,122,0.08)",
    purple: "#7C4FE0",
    purpleSoft: "rgba(124,79,224,0.08)",
    userBubble: "linear-gradient(135deg,#2B7FFF,#1A5FCC)",
    aiBubble: "#FFFFFF",
    shadow: "0 4px 24px rgba(43,127,255,0.1)",
    scrollbar: "#E0E8FF",
    inputBg: "#FFFFFF",
    navBg: "rgba(240,244,255,0.9)",
  },
};

const SAMPLE_SUGGESTIONS = [
  "Schedule a team meeting tomorrow at 3pm",
  "Remind me about dentist appointment Friday 10am",
  "Add 'Review Q4 report' to my tasks for next Monday",
  "Book gym session every weekday at 7am",
];

// EventCard, TypingIndicator, GoogleConnectButton, Sidebar, parseEventFromMessage, generateAIResponse
// Copying implementations from original file (omitted here for brevity in this creation step)

const EventCard = ({ event, theme }) => {
  const t = THEME[theme];
  const iconMap = { event: "📅", task: "✅", reminder: "🔔" };
  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.borderGlow}`,
      borderRadius: 14,
      padding: "14px 18px",
      marginTop: 10,
      boxShadow: `0 0 20px ${t.accentGlow}`,
      animation: "slideIn 0.4s cubic-bezier(.22,1,.36,1)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 18 }}>{iconMap[event.type] || "📅"}</span>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
          color: t.accent, textTransform: "uppercase",
          background: t.accentSoft, padding: "2px 8px", borderRadius: 6,
        }}>{event.type}</span>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
          color: t.green, textTransform: "uppercase",
          background: t.greenSoft, padding: "2px 8px", borderRadius: 6,
          marginLeft: "auto",
        }}>Added ✓</span>
      </div>
      <div style={{ fontWeight: 700, fontSize: 15, color: t.text, marginBottom: 4 }}>{event.title}</div>
      {event.date && <div style={{ fontSize: 13, color: t.textSoft }}>📆 {event.date}</div>}
      {event.time && <div style={{ fontSize: 13, color: t.textSoft }}>🕐 {event.time}</div>}
    </div>
  );
};

const TypingIndicator = ({ theme }) => {
  const t = THEME[theme];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 0" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: "50%",
          background: t.accent,
          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <span style={{ fontSize: 12, color: t.textMuted, marginLeft: 4 }}>Neona is thinking...</span>
    </div>
  );
};

const GoogleConnectButton = ({ connected, onConnect, theme }) => {
  const t = THEME[theme];
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onConnect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "9px 18px",
        borderRadius: 12,
        border: connected
          ? `1.5px solid ${t.green}`
          : `1.5px solid ${t.borderGlow}`,
        background: connected
          ? t.greenSoft
          : hover ? t.accentSoft : "transparent",
        color: connected ? t.green : t.textSoft,
        cursor: "pointer",
        fontSize: 13, fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif",
        transition: "all 0.25s cubic-bezier(.22,1,.36,1)",
        transform: hover ? "translateY(-1px)" : "translateY(0)",
        boxShadow: connected ? `0 0 16px ${t.greenSoft}` : hover ? `0 4px 16px ${t.accentGlow}` : "none",
        whiteSpace: "nowrap",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      {connected ? "Google Connected" : "Connect Google"}
      {connected && <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.green, animation: "pulse 2s infinite" }} />}
    </button>
  );
};

const Sidebar = ({ theme, chats, activeChat, setActiveChat, onNewChat, googleConnected, onGoogleConnect, collapsed, setCollapsed }) => {
  const t = THEME[theme];
  return (
    <div style={{
      width: collapsed ? 0 : 260,
      minWidth: collapsed ? 0 : 260,
      height: "100%",
      background: t.surface,
      borderRight: `1px solid ${t.border}`,
      display: "flex", flexDirection: "column",
      overflow: "hidden",
      transition: "all 0.35s cubic-bezier(.22,1,.36,1)",
      position: "relative",
      zIndex: 10,
    }}>
      <div style={{
        padding: "20px 20px 16px",
        borderBottom: `1px solid ${t.border}`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `linear-gradient(135deg, ${t.accent}, ${t.cyan})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 20px ${t.accentGlow}`,
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 18 }}>✦</span>
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 17, color: t.text, letterSpacing: "-0.02em", fontFamily: "'Syne', sans-serif" }}>Neona.ai</div>
          <div style={{ fontSize: 10, color: t.textMuted, letterSpacing: "0.12em", textTransform: "uppercase" }}>Calendar AI</div>
        </div>
      </div>

      <div style={{ padding: "14px 16px" }}>
        <button onClick={onNewChat} style={{
          width: "100%", padding: "10px 14px",
          borderRadius: 10,
          background: `linear-gradient(135deg, ${t.accent}, ${t.cyan})`,
          border: "none", color: "#fff",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 700, fontSize: 13,
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          boxShadow: `0 4px 20px ${t.accentGlow}`,
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
          onMouseEnter={e => { e.target.style.transform = "translateY(-1px)"; e.target.style.boxShadow = `0 8px 28px ${t.accentGlow}`; }}
          onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = `0 4px 20px ${t.accentGlow}`; }}
        >
          <span style={{ fontSize: 16 }}>+</span> New Conversation
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 10px" }}>
        <div style={{ fontSize: 10, color: t.textMuted, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "8px 8px 6px" }}>Recent</div>
        {chats.map(c => (
          <div key={c.id} onClick={() => setActiveChat(c.id)} style={{
            padding: "10px 12px", borderRadius: 10,
            background: activeChat === c.id ? t.accentSoft : "transparent",
            border: `1px solid ${activeChat === c.id ? t.borderGlow : "transparent"}`,
            cursor: "pointer", marginBottom: 2,
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { if (activeChat !== c.id) e.currentTarget.style.background = t.surfaceAlt; }}
            onMouseLeave={e => { if (activeChat !== c.id) e.currentTarget.style.background = "transparent"; }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: activeChat === c.id ? t.accent : t.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</div>
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>{c.time}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "14px 16px", borderTop: `1px solid ${t.border}` }}>
        <GoogleConnectButton connected={googleConnected} onConnect={onGoogleConnect} theme={theme} />
      </div>
    </div>
  );
};

const parseEventFromMessage = (text) => {
  const lowerText = text.toLowerCase();
  const isEvent = /meet|schedule|book|appointment|call|session|standup|lunch|dinner|interview|event|calendar/i.test(text);
  const isTask = /task|todo|remind|add to|work on|finish|complete|review/i.test(text);
  const timeMatch = text.match(/(\d{1,2}(?::\d{2})?(?:\s?[ap]m)?)/i);
  const dateWords = { today: "Today", tomorrow: "Tomorrow", monday: "Next Monday", tuesday: "Next Tuesday", wednesday: "Next Wednesday", thursday: "Next Thursday", friday: "Next Friday", saturday: "Next Saturday", sunday: "Next Sunday" };
  let dateStr = null;
  for (const [key, val] of Object.entries(dateWords)) {
    if (lowerText.includes(key)) { dateStr = val; break; }
  }
  const dateMatch = text.match(/(\w+ \d{1,2}(?:st|nd|rd|th)?)/i);
  if (!dateStr && dateMatch) dateStr = dateMatch[1];
  if (!isEvent && !isTask) return null;
  const titleGuess = text.replace(/(?:schedule|book|add|remind me about|create|set up|put)\s*/i, "").replace(/\s+(at|on|for|every)\s+.*/i, "").trim();
  return {
    type: isTask ? "task" : "event",
    title: titleGuess.charAt(0).toUpperCase() + titleGuess.slice(1),
    date: dateStr || "Date to be confirmed",
    time: timeMatch ? timeMatch[1].toUpperCase() : null,
  };
};

const generateAIResponse = (userMsg, googleConnected, event) => {
  if (!googleConnected) {
    return { text: "I'd love to help you schedule that! Please connect your Google account first using the button in the sidebar — it takes just a second 🔗", event: null };
  }
  if (event) {
    const timeStr = event.time ? ` at ${event.time}` : "";
    return {
      text: `✨ Got it! I've parsed your request and added it to your Google ${event.type === "task" ? "Tasks" : "Calendar"}.\n\nHere's what I created for you:`,
      event,
    };
  }
  const responses = [
    "I'm here to help you organize your schedule! Try saying something like: *'Schedule a team meeting tomorrow at 3pm'* or *'Add dentist appointment Friday 10am'*.",
    "I can add events, tasks, and reminders to your Google Calendar. Just describe what you need in plain English!",
    "Want me to schedule something? Just tell me what, when, and where — I'll handle the rest ✦",
  ];
  return { text: responses[Math.floor(Math.random() * responses.length)], event: null };
};

export default function NeonaAI() {
  const { data: session } = useSession();
  const [theme, setTheme] = useState("dark");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1, role: "ai",
      text: "Hey there! I'm **Neona**, your AI scheduling assistant ✦\n\nI understand natural language — just tell me what to schedule and I'll add it straight to your Google Calendar or Tasks. Try something like:\n\n*\"Schedule a team meeting tomorrow at 3pm\"*",
      event: null, ts: "Now",
    }
  ]);
  const [typing, setTyping] = useState(false);
  const googleConnected = Boolean(session?.user);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeChat, setActiveChat] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const t = THEME[theme];

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarCollapsed(true);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const chats = [
    { id: 1, title: "Team meeting setup", time: "2m ago" },
    { id: 2, title: "Weekly gym schedule", time: "1h ago" },
    { id: 3, title: "Doctor appointments", time: "Yesterday" },
    { id: 4, title: "Project deadlines Q4", time: "2d ago" },
  ];

  const sendMessage = useCallback(async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    const userMsg = { id: Date.now(), role: "user", text: msg, ts: "Now" };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 600));
    const event = parseEventFromMessage(msg);
    const { text: aiText, event: aiEvent } = generateAIResponse(msg, googleConnected, event);
    setTyping(false);
    setMessages(prev => [...prev, { id: Date.now() + 1, role: "ai", text: aiText, event: aiEvent, ts: "Just now" }]);
  }, [input, googleConnected]);

  const formatText = (text) => {
    return text.split("\n").map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) return <strong key={j}>{part.slice(2, -2)}</strong>;
        if (part.startsWith("*") && part.endsWith("*")) return <em key={j} style={{ color: t.accent }}>{part.slice(1, -1)}</em>;
        return part;
      });
      return <span key={i}>{parts}{i < text.split("\n").length - 1 && <br />}</span>;
    });
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${t.scrollbar}; border-radius: 2px; }
    @keyframes bounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-8px); } }
    @keyframes slideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.3); } }
    @keyframes shimmer { from { background-position: -200% center; } to { background-position: 200% center; } }
    @keyframes glow { 0%,100% { box-shadow: 0 0 20px ${t.accentGlow}; } 50% { box-shadow: 0 0 40px ${t.accentGlow}, 0 0 60px ${t.cyanSoft}; } }
    @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
    .msg-enter { animation: slideIn 0.4s cubic-bezier(.22,1,.36,1) both; }
    .suggestion-btn:hover { transform: translateY(-2px) !important; background: ${t.accentSoft} !important; border-color: ${t.accent} !important; }
    textarea:focus { outline: none; }
    textarea::placeholder { color: ${t.textMuted}; }
    textarea { resize: none; }
    .send-btn:hover { transform: scale(1.08) !important; }
    .send-btn:active { transform: scale(0.95) !important; }
  `;

  return (
    <>
      <style>{css}</style>
      <div style={{
        width: "100%", height: "100vh",
        background: t.bg,
        display: "flex", flexDirection: "column",
        fontFamily: "'DM Sans', sans-serif",
        color: t.text,
        overflow: "hidden",
        position: "relative",
      }}>
        {/* Background ambient glow */}
        <div style={{
          position: "absolute", top: 0, left: "30%", width: 500, height: 400,
          background: `radial-gradient(ellipse at center, ${t.accentGlow} 0%, transparent 70%)`,
          pointerEvents: "none", zIndex: 0, opacity: 0.4,
        }} />
        <div style={{
          position: "absolute", bottom: "20%", right: "10%", width: 300, height: 300,
          background: `radial-gradient(ellipse at center, ${t.cyanSoft} 0%, transparent 70%)`,
          pointerEvents: "none", zIndex: 0,
        }} />

        <div style={{ display: "flex", height: "100%", position: "relative", zIndex: 1 }}>
          {/* Sidebar */}
          {!isMobile && (
            <Sidebar
              theme={theme} chats={chats}
              activeChat={activeChat} setActiveChat={setActiveChat}
              onNewChat={() => setMessages([{ id: Date.now(), role: "ai", text: "New conversation started! What would you like to schedule? ✦", event: null, ts: "Now" }])}
              googleConnected={googleConnected}
              onGoogleConnect={() => signIn('google', { callbackUrl: '/auth/connected' })}
              collapsed={sidebarCollapsed}
              setCollapsed={setSidebarCollapsed}
            />
          )}

          {/* Main Chat Area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            {/* Top Nav */}
            <div style={{
              padding: isMobile ? "12px 16px" : "14px 24px",
              background: t.navBg,
              backdropFilter: "blur(20px)",
              borderBottom: `1px solid ${t.border}`,
              display: "flex", alignItems: "center", gap: 12,
              flexShrink: 0,
            }}>
              <button onClick={() => setSidebarCollapsed(s => !s)} style={{
                background: "none", border: "none", cursor: "pointer",
                color: t.textMuted, padding: 6, borderRadius: 8,
                display: "flex", alignItems: "center",
                transition: "color 0.2s, background 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.color = t.text}
                onMouseLeave={e => e.currentTarget.style.color = t.textMuted}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>

              {isMobile && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: `linear-gradient(135deg, ${t.accent}, ${t.cyan})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 0 12px ${t.accentGlow}`, fontSize: 14,
                    animation: "glow 3s ease-in-out infinite",
                  }}>✦</div>
                  <span style={{ fontWeight: 800, fontSize: 16, fontFamily: "'Syne', sans-serif", color: t.text }}>Neona.ai</span>
                </div>
              )}

              <div style={{ flex: 1 }} />

              {/* Model badge */}
              <div style={{
                padding: "4px 12px", borderRadius: 20,
                background: t.purpleSoft, border: `1px solid ${t.purple}30`,
                fontSize: 11, fontWeight: 700, color: t.purple,
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}>Neona Pro</div>

              {isMobile && (
                <GoogleConnectButton connected={googleConnected} onConnect={() => signIn('google', { callbackUrl: '/auth/connected' })} theme={theme} />
              )}

              {/* Theme toggle */}
              <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} style={{
                width: 36, height: 36, borderRadius: 10,
                background: t.surfaceAlt, border: `1px solid ${t.border}`,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, transition: "transform 0.3s, border-color 0.3s",
                color: t.textSoft,
              }}
                onMouseEnter={e => e.currentTarget.style.transform = "rotate(15deg)"}
                onMouseLeave={e => e.currentTarget.style.transform = "rotate(0)"}
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: "auto",
              padding: isMobile ? "16px 12px" : "24px 28px",
              display: "flex", flexDirection: "column", gap: 4,
            }}>
              {messages.map((msg, idx) => (
                <div key={msg.id} className="msg-enter" style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: 12,
                  animationDelay: `${idx === messages.length - 1 ? 0 : 0}s`,
                }}>
                  {msg.role === "ai" && (
                    <div style={{
                      width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                      background: `linear-gradient(135deg, ${t.accent}, ${t.cyan})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, marginRight: 10, marginTop: 4,
                      boxShadow: `0 0 12px ${t.accentGlow}`,
                      animation: "float 4s ease-in-out infinite",
                    }}>✦</div>
                  )}
                  <div style={{ maxWidth: isMobile ? "85%" : "68%" }}>
                    <div style={{
                      padding: isMobile ? "12px 14px" : "14px 18px",
                      borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                      background: msg.role === "user" ? t.userBubble : t.aiBubble,
                      border: `1px solid ${msg.role === "user" ? "rgba(79,158,255,0.2)" : t.border}`,
                      color: msg.role === "user" ? "#fff" : t.text,
                      fontSize: isMobile ? 14 : 14.5,
                      lineHeight: 1.65,
                      boxShadow: msg.role === "user" ? `0 4px 20px ${t.accentGlow}` : t.shadow,
                    }}>
                      {formatText(msg.text)}
                      {msg.event && <EventCard event={msg.event} theme={theme} />}
                    </div>
                    <div style={{ fontSize: 10, color: t.textMuted, marginTop: 4, textAlign: msg.role === "user" ? "right" : "left", paddingLeft: 4 }}>{msg.ts}</div>
                  </div>
                  {msg.role === "user" && (
                    <div style={{
                      width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                      background: `linear-gradient(135deg, ${t.accent}50, ${t.purple}50)`,
                      border: `1px solid ${t.borderGlow}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, marginLeft: 10, marginTop: 4,
                    }}>👤</div>
                  )}
                </div>
              ))}
              {typing && (
                <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                    background: `linear-gradient(135deg, ${t.accent}, ${t.cyan})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, marginRight: 10,
                    boxShadow: `0 0 12px ${t.accentGlow}`,
                  }}>✦</div>
                  <div style={{
                    padding: "12px 16px", borderRadius: "4px 18px 18px 18px",
                    background: t.aiBubble, border: `1px solid ${t.border}`,
                  }}>
                    <TypingIndicator theme={theme} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 2 && (
              <div style={{
                padding: isMobile ? "8px 12px" : "8px 28px",
                display: "flex", gap: 8, flexWrap: "wrap",
              }}>
                {SAMPLE_SUGGESTIONS.slice(0, isMobile ? 2 : 4).map((s, i) => (
                  <button key={i} className="suggestion-btn" onClick={() => sendMessage(s)} style={{
                    padding: "7px 14px", borderRadius: 20,
                    background: "transparent",
                    border: `1px solid ${t.border}`,
                    color: t.textSoft, fontSize: 12, fontWeight: 500,
                    cursor: "pointer", transition: "all 0.2s",
                    fontFamily: "'DM Sans', sans-serif",
                    whiteSpace: "nowrap",
                  }}>{s}</button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div style={{
              padding: isMobile ? "12px" : "16px 24px",
              borderTop: `1px solid ${t.border}`,
              background: t.navBg,
              backdropFilter: "blur(20px)",
              flexShrink: 0,
            }}>
              <div style={{
                display: "flex", alignItems: "flex-end", gap: 10,
                background: t.inputBg,
                border: `1.5px solid ${inputFocused ? t.borderGlow : t.border}`,
                borderRadius: 16,
                padding: "10px 12px 10px 16px",
                transition: "border-color 0.25s, box-shadow 0.25s",
                boxShadow: inputFocused ? `0 0 0 3px ${t.accentSoft}, 0 4px 20px ${t.accentGlow}` : "none",
                animation: inputFocused ? "glow 2s ease-in-out infinite" : "none",
              }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                  }}
                  placeholder="Tell me what to schedule... 'Meeting tomorrow 3pm'"
                  rows={1}
                  style={{
                    flex: 1, background: "none", border: "none",
                    color: t.text, fontSize: 14, fontFamily: "'DM Sans', sans-serif",
                    lineHeight: 1.5, maxHeight: 120, overflowY: "auto",
                    fontWeight: 400,
                  }}
                />

                {/* Attach / Voice buttons */}
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                  <button style={{
                    width: 32, height: 32, borderRadius: 8, background: "none",
                    border: "none", color: t.textMuted, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "color 0.2s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = t.text}
                    onMouseLeave={e => e.currentTarget.style.color = t.textMuted}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="22"/>
                    </svg>
                  </button>

                  <button className="send-btn" onClick={() => sendMessage()} style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: input.trim()
                      ? `linear-gradient(135deg, ${t.accent}, ${t.cyan})`
                      : t.surfaceAlt,
                    border: "none", cursor: input.trim() ? "pointer" : "default",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.25s cubic-bezier(.22,1,.36,1)",
                    boxShadow: input.trim() ? `0 4px 16px ${t.accentGlow}` : "none",
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? "#fff" : t.textMuted} strokeWidth="2.5" strokeLinecap="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div style={{
                textAlign: "center", fontSize: 11, color: t.textMuted,
                marginTop: 8, letterSpacing: "0.02em",
              }}>
                Neona.ai · Enter to send · Shift+Enter for new line
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {isMobile && !sidebarCollapsed && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 100,
            display: "flex",
          }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
              onClick={() => setSidebarCollapsed(true)} />
            <div style={{ position: "relative", zIndex: 1, height: "100%", width: 260 }}>
              <Sidebar
                theme={theme} chats={chats}
                activeChat={activeChat} setActiveChat={(id) => { setActiveChat(id); setSidebarCollapsed(true); }}
                onNewChat={() => { setMessages([{ id: Date.now(), role: "ai", text: "New conversation! What to schedule? ✦", event: null, ts: "Now" }]); setSidebarCollapsed(true); }}
                googleConnected={googleConnected}
                onGoogleConnect={() => signIn('google', { callbackUrl: '/auth/connected' })}
                collapsed={false}
                setCollapsed={setSidebarCollapsed}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
