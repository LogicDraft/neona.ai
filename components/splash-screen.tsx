"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // 1900ms total duration + 50ms buffer for react to unmount smoothly
    const timer = setTimeout(() => {
      setShow(false);
    }, 1950);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="splash-screen">
      <img src="/app_icon.png" alt="Neona.ai Logo" className="splash-logo" />
    </div>
  );
}
