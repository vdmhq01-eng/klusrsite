import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

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

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
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
