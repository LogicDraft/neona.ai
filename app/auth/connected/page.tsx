import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";

function buildUsername(name?: string | null, email?: string | null) {
  const source = (name?.trim() || email?.split("@")[0] || "username").toLowerCase();
  const slug = source.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || "username";
}

export const dynamic = "force-dynamic";

export default async function ConnectedAuthPage() {
  const hdrs = await headers();
  try {
    console.log("[auth.connected] incoming cookies:", hdrs.get("cookie"));
  } catch (e) {
    // ignore
  }

  const session = await getServerSession(authOptions);

  console.log("[auth.connected] server session:", Boolean(session), session?.user?.email ?? null);

  if (session) {
    const username = buildUsername(session.user?.name, session.user?.email);
    redirect(`/${encodeURIComponent(username)}`);
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0d1117", color: "#f5f7fb", padding: "2rem", textAlign: "center" }}>
      <div style={{ width: "100%", maxWidth: 420, borderRadius: 24, padding: "1.5rem", background: "rgba(15, 23, 42, 0.92)", boxShadow: "0 24px 80px rgba(0,0,0,0.35)" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>Finishing sign-in</h1>
        <p style={{ opacity: 0.8, maxWidth: 420 }}>
          Completing Google authentication and redirecting you to your profile.
        </p>
      </div>
    </main>
  );
}