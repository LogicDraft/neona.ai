import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/app/providers";
import SplashScreen from "@/components/splash-screen";

export const metadata: Metadata = {
  title: "Neona.ai",
  description: "Schedule events, tasks, and reminders using natural language with Neona.ai.",
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
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        />
      </head>
      <body>
        <SplashScreen />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
