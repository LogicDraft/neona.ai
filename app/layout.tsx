import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/app/providers";
import BottomNav from "@/components/bottom-nav";

export const metadata: Metadata = {
  title: "Neona AI",
  description: "A modern AI scheduling assistant.",
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
  themeColor: "#0D0D0D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="h-full bg-white text-zinc-900 antialiased dark:bg-[#212121] dark:text-zinc-100">
        <Providers>
          {children}
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
