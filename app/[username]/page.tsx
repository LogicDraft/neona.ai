import Link from "next/link";

type ProfilePageProps = {
  params: Promise<{ username: string }>;
};

function decodeUsername(value: string) {
  return decodeURIComponent(value).replace(/-/g, " ");
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = await params;
  const displayName = decodeUsername(resolvedParams.username);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem", background: "radial-gradient(circle at top, rgba(16, 163, 127, 0.18), transparent 42%), linear-gradient(180deg, #081018 0%, #0d1117 100%)", color: "#f5f7fb" }}>
      <section style={{ width: "100%", maxWidth: 560, borderRadius: 28, padding: "2rem", background: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 32px 100px rgba(0,0,0,0.4)" }}>
        <p style={{ margin: 0, opacity: 0.7, letterSpacing: "0.12em", textTransform: "uppercase", fontSize: "0.75rem" }}>Logged in</p>
        <h1 style={{ margin: "0.5rem 0 0", fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.05 }}>Welcome, {displayName}</h1>
        <p style={{ marginTop: "1rem", fontSize: "1.05rem", lineHeight: 1.6, opacity: 0.85 }}>
          Your sign-in flow now lands on a user-specific page at <strong>/{resolvedParams.username}</strong>.
        </p>
        <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/" style={{ borderRadius: 999, padding: "0.9rem 1.2rem", background: "#10A37F", color: "white", fontWeight: 700, textDecoration: "none" }}>
            Open Neona
          </Link>
          <Link href="/auth/connected" style={{ borderRadius: 999, padding: "0.9rem 1.2rem", border: "1px solid rgba(255,255,255,0.12)", color: "#f5f7fb", textDecoration: "none" }}>
            View connection state
          </Link>
        </div>
      </section>
    </main>
  );
}