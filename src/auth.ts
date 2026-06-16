import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { randomBytes } from "crypto";
import {
  verifyPassword,
  getUser,
  setVerified,
  consumeAuthToken,
} from "@/lib/store/users";

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
        magicToken: { label: "Magic token", type: "text" },
      },
      async authorize(credentials) {
        // 1) Magic-link login: token uit de inlogmail. Klikken op de link bewijst
        //    e-mailbezit, dus we bevestigen het account meteen.
        const magicToken = String(credentials?.magicToken ?? "");
        if (magicToken) {
          const email = await consumeAuthToken(magicToken);
          if (!email) return null;
          await setVerified(email);
          const user = await getUser(email);
          return user ? { id: user.email, email: user.email, name: user.name } : null;
        }

        // 2) Wachtwoord-login tegen een bevestigd account.
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!EMAIL_RE.test(email) || !password) return null;
        const user = await verifyPassword(email, password);
        return user ? { id: user.email, email: user.email, name: user.name } : null;
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

/**
 * Admin-allowlist via env `ADMIN_EMAILS` (komma-gescheiden). Fail-closed: zonder
 * deze env-var is er GEEN admin en is het beheer volledig dicht. Zo voeg je een
 * "admin-account" toe door het e-mailadres aan ADMIN_EMAILS te zetten in Vercel.
 */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(/[,\s;]+/)
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

/** Sessie alleen teruggeven als de ingelogde gebruiker admin is, anders null. */
export async function getAdminSession() {
  const session = await getSession();
  return isAdminEmail(session?.user?.email) ? session : null;
}
