/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // De feed-afbeeldingen komen van prosteps.cloudimg.io (al op 580x580) en de
    // Vercel-image-optimizer haalt die niet betrouwbaar op → kapotte foto's.
    // Onbewerkt laden lost dit op; de CDN doet de resizing zelf al.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      // Tilroy / De Voordeelmarkt product imagery (Google feed image host)
      { protocol: "https", hostname: "prosteps.cloudimg.io" },
      { protocol: "https", hostname: "tilroy.s3.eu-west-1.amazonaws.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async redirects() {
    // KLUSR is 100% online — er zijn geen fysieke winkels. De oude
    // /winkels-pagina's zijn verwijderd; verwijs oude links/SEO permanent
    // naar de homepage zodat er geen 404's of dode links ontstaan.
    return [
      { source: "/winkels", destination: "/", permanent: true },
      { source: "/winkels/:slug", destination: "/", permanent: true },
    ];
  },
  async rewrites() {
    // Apple Pay-domeinvalidatie: serveer het Mollie-bestand op het door Apple
    // vereiste .well-known-pad (de route proxyt het rechtstreeks van Mollie).
    return [
      {
        source: "/.well-known/apple-developer-merchantid-domain-association",
        destination: "/api/applepay-domain-association",
      },
    ];
  },
};

export default nextConfig;
