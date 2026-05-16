"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

function ThemeSync() {
  useEffect(() => {
    const apply = (dark: boolean) => {
      document.documentElement.classList.toggle("dark", dark);
    };
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    apply(mq.matches);
    const handler = (e: MediaQueryListEvent) => apply(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeSync />
      {children}
    </SessionProvider>
  );
}
