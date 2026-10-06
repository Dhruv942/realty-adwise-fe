import type { Metadata, Viewport } from "next";
import { Josefin_Sans, Jost } from "next/font/google";
import { InstallPrompt } from "@/components/InstallPrompt";
import "./globals.css";

const display = Josefin_Sans({ subsets: ["latin"], weight: ["200", "300", "400"], variable: "--f-display" });
const body = Jost({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--f-body" });

export const metadata: Metadata = {
  title: { default: "Realty Adwise Portal", template: "%s · Realty Adwise" },
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Realty Adwise", statusBarStyle: "default" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#fbfbf9" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Browser extensions (Grammarly, password managers, dark-mode tools) inject attributes into
    // <html>/<body> before React hydrates; this silences those mismatches on these two tags only.
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
