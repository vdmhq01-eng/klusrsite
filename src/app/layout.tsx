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
import { ConsentDefault } from "@/components/analytics/consent-init";
import { CookieConsent } from "@/components/analytics/cookie-consent";
import { AuthProvider } from "@/components/auth/auth-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.klus-r.nl").replace(/\/$/, "");

// Google Search Console verificatie — plak de token uit de "HTML-tag"-methode
// in deze env-variabele; dan rendert Next de <meta name="google-site-verification">.
const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "KLUSR",
  url: siteUrl,
  logo: `${siteUrl}/icon.svg`,
  image: `${siteUrl}/icon.svg`,
  description:
    "KLUSR is dé verfspeciaalzaak en lichte bouwmarkt: professionele verf op kleur gemengd, ijzerwaren, gereedschap en meer, met advies van ex-schilders.",
  sameAs: [
    "https://www.facebook.com/",
    "https://www.instagram.com/",
    "https://www.youtube.com/",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "KLUSR",
  url: siteUrl,
  inLanguage: "nl-NL",
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/zoeken?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "KLUSR — De beste VERF en alles voor jouw klus",
    template: "%s | KLUSR",
  },
  description:
    "KLUSR is dé verfspeciaalzaak en lichte bouwmarkt. Professionele verf op kleur gemengd, ijzerwaren, gereedschap en meer. Advies van ex-schilders. Voor 19:00 besteld, morgen in huis.",
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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  ...(googleSiteVerification
    ? { verification: { google: googleSiteVerification } }
    : {}),
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
        <ConsentDefault />
        <GoogleTagManager />
      </head>
      <body className="flex min-h-screen flex-col bg-background font-sans">
        <GoogleTagManagerNoScript />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <AuthProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
          >
            Naar hoofdinhoud
          </a>
          <Header />
          <main id="main" tabIndex={-1} className="flex-1 pb-16 outline-none lg:pb-0">
            {children}
          </main>
          <Footer />
          <MobileBottomNav />
          <GlobalOverlays />
        </AuthProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
