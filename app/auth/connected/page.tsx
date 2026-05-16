"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

function buildUsername(name?: string | null, email?: string | null) {
  const source = (name?.trim() || email?.split("@")[0] || "username").toLowerCase();
  const slug = source.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || "username";
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36).slice(0, 6).toUpperCase().padStart(6, "0");
}

export default function ConnectedAuthPage() {
  const router = useRouter();
  const { status, data: session } = useSession();
  const [copied, setCopied] = useState(false);
  const username = useMemo(() => buildUsername(session?.user?.name, session?.user?.email), [session?.user?.email, session?.user?.name]);

  const connectionKey = useMemo(() => {
    const email = session?.user?.email ?? session?.user?.name ?? "neona-user";
    return `NEONA-${hashString(email)}`;
  }, [session?.user?.email, session?.user?.name]);

  useEffect(() => {
    if (status === "authenticated") {
      const timer = window.setTimeout(() => router.replace(`/${encodeURIComponent(username)}`), 1800);
      return () => window.clearTimeout(timer);
    }
  }, [router, status, username]);

  async function copyKey() {
    await navigator.clipboard.writeText(connectionKey);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0d1117", color: "#f5f7fb", padding: "2rem", textAlign: "center" }}>
      <div style={{ width: "100%", maxWidth: 420, borderRadius: 24, padding: "1.5rem", background: "rgba(15, 23, 42, 0.92)", boxShadow: "0 24px 80px rgba(0,0,0,0.35)" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>Google connected</h1>
        <p style={{ opacity: 0.8, maxWidth: 420 }}>
          Finishing sign-in. Your connection key is ready for this session.
        </p>
        <div style={{ marginTop: "1.25rem", padding: "1rem", borderRadius: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: "0.78rem", opacity: 0.65, marginBottom: "0.4rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>Connection Key</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "0.12em" }}>{connectionKey}</div>
        </div>
        <button
          type="button"
          onClick={copyKey}
          style={{ marginTop: "1rem", border: "none", borderRadius: 999, padding: "0.85rem 1.1rem", background: "#10A37F", color: "white", fontWeight: 700, cursor: "pointer", width: "100%" }}
        >
          {copied ? "Copied" : "Copy key"}
        </button>
        <p style={{ marginTop: "0.75rem", opacity: 0.6, fontSize: "0.9rem" }}>
          You will be sent to <span style={{ wordBreak: "break-all" }}>/{username}</span> automatically.
        </p>
      </div>
    </main>
  );
}