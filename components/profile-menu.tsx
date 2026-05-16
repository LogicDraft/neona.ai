"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div className="profile-menu" ref={rootRef}>
      <button type="button" className="profile-menu-trigger" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Open settings menu">
        <span>N</span>
      </button>

      {open ? (
        <div className="profile-menu-panel" role="menu" aria-label="Settings menu">
          <Link href="/help" role="menuitem" className="profile-menu-item" onClick={() => setOpen(false)}>
            Help center
          </Link>
          <Link href="/terms" role="menuitem" className="profile-menu-item" onClick={() => setOpen(false)}>
            Terms of use
          </Link>
          <Link href="/privacy" role="menuitem" className="profile-menu-item" onClick={() => setOpen(false)}>
            Privacy policy
          </Link>
          <Link href="/licenses" role="menuitem" className="profile-menu-item" onClick={() => setOpen(false)}>
            Licenses
          </Link>
          <Link href="/about" role="menuitem" className="profile-menu-item" onClick={() => setOpen(false)}>
            About
          </Link>
        </div>
      ) : null}
    </div>
  );
}
