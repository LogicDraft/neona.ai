"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Fab() {
  const [open, setOpen] = useState(false);

  return (
    <div className={`fab ${open ? "open" : ""}`} aria-hidden={false}>
      <div className="fab-actions" role="menu" aria-hidden={!open}>
        <Link href="#" className="fab-action" role="menuitem">
          <div className="fab-action-icon">📷</div>
          <div className="fab-action-label">Create an image</div>
        </Link>
        <Link href="#" className="fab-action" role="menuitem">
          <div className="fab-action-icon">✏️</div>
          <div className="fab-action-label">Write or edit</div>
        </Link>
        <Link href="#" className="fab-action" role="menuitem">
          <div className="fab-action-icon">🌐</div>
          <div className="fab-action-label">Look something up</div>
        </Link>
      </div>

      <button
        className="fab-button"
        aria-label={open ? "Close composer" : "Open composer"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 24 24" className="icon fab-svg" aria-hidden>
          <path d="M12 5v14M5 12h14" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
