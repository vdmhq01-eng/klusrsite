import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { randomBytes } from "crypto";

/**
 * Authenticatie via Auth.js (NextAuth v5) met **e-mail + wachtwoord** en
 * JWT-sessies (geen database nodig).
 *
 * DEMO: er is nog geen gebruikersdatabase, dus elk geldig e-mailadres met een
 * wachtwoord van minimaal 6 tekens logt in. Vervang `authorize` door echte
 * gebruikersverificatie (database + wachtwoord-hash) voor productie. Een
 * magic-link- of OAuth-provider kan later worden toegevoegd.
 *
 * Zet in productie AUTH_SECRET (openssl rand -base64 33) zodat sessies tussen
 * serverinstances behouden blijven.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const secret = process.env.AUTH_SECRET || randomBytes(32).toString("hex");
if (!process.env.AUTH_SECRET) {
  console.warn(
    "[auth] AUTH_SECRET ontbreekt — zet 'm in productie zodat ingelogde sessies " +
      "tussen instances behouden blijven.",
  );
}

/** Login is altijd beschikbaar (e-mail/wachtwoord). */
export const authConfigured = true;

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "E-mail",
      credentials: {
        email: { label: "E-mailadres", type: "email" },
        password: { label: "Wachtwoord", type: "password" },
      },
      authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        // DEMO-verificatie (geen gebruikersdatabase): geldig e-mailadres + min. 6 tekens.
        if (EMAIL_RE.test(email) && password.length >= 6) {
          const name = email.split("@")[0].replace(/[._-]+/g, " ").trim();
          return { id: email, email, name: name || email };
        }
        return null;
      },
    }),
  ],
  secret,
  session: { strategy: "jwt" },
  pages: { signIn: "/inloggen" },
  trustHost: true,
});

/** Sessie ophalen zonder te crashen als er nog iets ontbreekt. */
export async function getSession() {
  try {
    return await auth();
  } catch {
    return null;
  }
}
