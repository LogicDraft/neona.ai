export default function AboutPage() {
  return (
    <main className="settings-view">
      <div className="settings-header">
        <h1>About</h1>
      </div>
      <section className="settings-card">
        <h2>Neona AI Scheduler</h2>
        <p style={{ color: "var(--muted)", marginTop: 6 }}>Mobile-first assistant that turns natural language into calendar events and tasks.</p>
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <a className="settings-row" href="https://github.com/LogicDraft" target="_blank" rel="noreferrer">Github</a>
          <a className="settings-row" href="mailto:gowdagowtham1025@gmail.com">Contact</a>
        </div>
      </section>
    </main>
  );
}
