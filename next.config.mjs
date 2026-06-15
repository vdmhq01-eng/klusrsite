/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
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
};

export default nextConfig;
