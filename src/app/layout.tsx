import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { GlobalOverlays } from "@/components/layout/global-overlays";
import {
  GoogleTagManager,
  GoogleTagManagerNoScript,
} from "@/components/analytics/gtm";
import { AuthProvider } from "@/components/auth/auth-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "KLUSR — De beste VERF en alles voor jouw klus",
    template: "%s | KLUSR",
  },
  description:
    "KLUSR is dé verfspeciaalzaak en lichte bouwmarkt. Professionele verf op kleur gemengd, ijzerwaren, gereedschap en meer. Advies van ex-schilders. Voor 16:00 besteld, morgen in huis.",
  keywords: [
    "verf kopen",
    "verfwinkel",
    "bouwmarkt",
    "verf op kleur",
    "gereedschap",
    "KLUSR",
  ],
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: "KLUSR",
    title: "KLUSR — De beste VERF en alles voor jouw klus",
    description:
      "Professionele verf op kleur gemengd, ijzerwaren, gereedschap en meer. Advies van ex-schilders.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#C90000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className={inter.variable}>
      <head>
        <GoogleTagManager />
      </head>
      <body className="flex min-h-screen flex-col bg-background font-sans">
        <GoogleTagManagerNoScript />
        <AuthProvider>
          <Header />
          <main className="flex-1 pb-16 lg:pb-0">{children}</main>
          <Footer />
          <MobileBottomNav />
          <GlobalOverlays />
        </AuthProvider>
      </body>
    </html>
  );
}
