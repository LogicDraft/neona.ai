import Link from "next/link";

export default function HelpPage() {
  return (
    <main className="settings-view" style={{ paddingTop: 20 }}>
      <div className="settings-header">
        <h1>Help center</h1>
      </div>

      <section className="settings-card">
        <div>
          <h2>Resources</h2>
          <p style={{ color: "var(--muted)", marginTop: 6 }}>Contact and support links.</p>
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          <a className="settings-row" href="https://github.com/LogicDraft" target="_blank" rel="noreferrer">
            <span>Github: LogicDraft</span>
          </a>
          <a className="settings-row" href="mailto:gowdagowtham1025@gmail.com">
            <span>Gmail: gowdagowtham1025@gmail.com</span>
          </a>
        </div>
      </section>

      <section className="settings-card">
        <div style={{ display: "grid", gap: 8 }}>
          <Link className="settings-row" href="/terms">Terms of use</Link>
          <Link className="settings-row" href="/privacy">Privacy policy</Link>
          <Link className="settings-row" href="/licenses">Licenses</Link>
          <Link className="settings-row" href="/about">About</Link>
        </div>
      </section>
    </main>
  );
}
