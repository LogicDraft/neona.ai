import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/app/providers";
import BottomNav from "@/components/bottom-nav";

export const metadata: Metadata = {
  title: "Neona AI — Smart Scheduling Assistant",
  description: "Schedule events, tasks, and reminders using natural language with Neona AI.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)",  color: "#0d0d0f" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="h-full antialiased">
        <Providers>
          {children}
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
