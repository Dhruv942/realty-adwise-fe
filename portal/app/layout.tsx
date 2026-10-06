import type { Metadata, Viewport } from "next";
import { Archivo, Poppins } from "next/font/google";
import { InstallPrompt } from "@/components/InstallPrompt";
import { THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";

const display = Archivo({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--f-display", display: "swap" });
const body = Poppins({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--f-body", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Realty Adwise Portal", template: "%s · Realty Adwise" },
  description: "Internal portal for the Realty Adwise team to manage leads, properties, clients and executives.",
  applicationName: "Realty Adwise",
  // Private, signed-in portal: nothing here should be indexed. robots.ts says the same to crawlers.
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  appleWebApp: { capable: true, title: "Realty Adwise", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0e0d" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the theme script sets data-theme on <html> before React hydrates, and
    // browser extensions inject attributes into <html>/<body>. It only silences these two tags.
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
