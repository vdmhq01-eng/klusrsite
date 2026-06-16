import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { randomBytes } from "crypto";

/**
 * Echte authenticatie via Auth.js (NextAuth v5), JWT-sessies (geen database
 * nodig). Providers worden alleen ingeschakeld als hun OAuth-credentials in de
 * omgeving staan, zodat de app ook zonder config netjes bouwt en draait.
 *
 * Activeren: zet in de omgeving
 *   AUTH_SECRET            (verplicht — genereer met: openssl rand -base64 33)
 *   AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET     (Google OAuth)
 *   AUTH_GITHUB_ID / AUTH_GITHUB_SECRET     (optioneel, GitHub OAuth)
 */
const providers = [];
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) providers.push(Google);
if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) providers.push(GitHub);

/** True zodra er minstens één OAuth-provider geconfigureerd is. */
export const authConfigured = providers.length > 0;

// Auth.js vereist altijd een `secret`, óók als er nog geen providers zijn —
// anders crasht /api/auth/session met MissingSecret. Zonder providers worden er
// geen echte sessies uitgegeven, dus een vluchtige random fallback volstaat en
// voorkomt dat we een secret hardcoden. In productie zet je AUTH_SECRET.
const secret = process.env.AUTH_SECRET || randomBytes(32).toString("hex");
if (authConfigured && !process.env.AUTH_SECRET) {
  console.warn(
    "[auth] AUTH_SECRET ontbreekt terwijl er providers zijn geconfigureerd — " +
      "sessies blijven niet behouden tussen instances. Zet AUTH_SECRET.",
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  secret,
  session: { strategy: "jwt" },
  pages: { signIn: "/inloggen" },
  trustHost: true,
});

/** Sessie ophalen zonder te crashen als AUTH_SECRET/config nog ontbreekt. */
export async function getSession() {
  try {
    return await auth();
  } catch {
    return null;
  }
}
