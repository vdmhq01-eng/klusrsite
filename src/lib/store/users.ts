/**
 * Gebruikersopslag voor échte authenticatie — dependency-vrij.
 *
 * - Wachtwoorden gehasht met Node's `scrypt` (geen bcrypt-package nodig).
 * - Opslag in Vercel KV wanneer geconfigureerd; anders in-memory (demo).
 * - Eenmalige tokens voor e-mailbevestiging en magic-link login.
 *
 * Zonder KV resetten accounts bij een cold start — zet KV aan voor productie.
 */

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { isKvEnabled, kvGetJSON, kvSetJSON, kvDel } from "./kv";

const scryptAsync = promisify(scrypt);

export interface User {
  email: string;
  name: string;
  /** "salt:hash" (hex). Afwezig bij magic-link-only accounts. */
  passwordHash?: string;
  verified: boolean;
  createdAt: string;
}

interface TokenData {
  email: string;
  exp: number;
}

const memUsers = new Map<string, User>();
const memTokens = new Map<string, TokenData>();

const norm = (e: string) => e.trim().toLowerCase();
const KEY = {
  user: (e: string) => `user:${norm(e)}`,
  token: (t: string) => `authtoken:${t}`,
};

const VERIFY_TTL = 24 * 60 * 60 * 1000; // 24 uur
const MAGIC_TTL = 30 * 60 * 1000; // 30 minuten
const RESET_TTL = 60 * 60 * 1000; // 60 min

async function hashPassword(pw: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(pw, salt, 64)) as Buffer;
  return `${salt}:${buf.toString("hex")}`;
}

async function checkPassword(pw: string, stored?: string): Promise<boolean> {
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const buf = (await scryptAsync(pw, salt, 64)) as Buffer;
  const expected = Buffer.from(hash, "hex");
  return expected.length === buf.length && timingSafeEqual(expected, buf);
}

export async function getUser(email: string): Promise<User | null> {
  if (isKvEnabled()) {
    const u = await kvGetJSON<User>(KEY.user(email));
    if (u) return u;
  }
  return memUsers.get(norm(email)) ?? null;
}

async function saveUser(u: User): Promise<void> {
  memUsers.set(norm(u.email), u);
  if (isKvEnabled()) await kvSetJSON(KEY.user(u.email), u);
}

export async function createUser(input: {
  email: string;
  name?: string;
  password?: string;
  verified?: boolean;
}): Promise<{ ok: boolean; error?: "exists"; user?: User }> {
  const email = norm(input.email);
  if (await getUser(email)) return { ok: false, error: "exists" };
  const passwordHash = input.password ? await hashPassword(input.password) : undefined;
  const user: User = {
    email,
    name: input.name?.trim() || email.split("@")[0].replace(/[._-]+/g, " ").trim(),
    passwordHash,
    verified: Boolean(input.verified),
    createdAt: new Date().toISOString(),
  };
  await saveUser(user);
  return { ok: true, user };
}

export async function setVerified(email: string): Promise<void> {
  const u = await getUser(email);
  if (u && !u.verified) {
    u.verified = true;
    await saveUser(u);
  }
}

/**
 * Stel een (nieuw) wachtwoord in voor een bestaande gebruiker. Een geslaagde
 * reset bewijst e-mailbezit, dus markeren we het account meteen als bevestigd.
 * Geeft false terug als er geen account met dit e-mailadres bestaat.
 */
export async function setPassword(email: string, password: string): Promise<boolean> {
  const u = await getUser(email);
  if (!u) return false;
  u.passwordHash = await hashPassword(password);
  u.verified = true;
  await saveUser(u);
  return true;
}

/** Controleer e-mail + wachtwoord. Geeft de user alleen terug als die bevestigd is. */
export async function verifyPassword(email: string, password: string): Promise<User | null> {
  const u = await getUser(email);
  if (!u || !u.verified || !u.passwordHash) return null;
  return (await checkPassword(password, u.passwordHash)) ? u : null;
}

/* ----------------------------------------------------------------- tokens */

async function createToken(email: string, ttl: number): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const data: TokenData = { email: norm(email), exp: Date.now() + ttl };
  memTokens.set(token, data);
  if (isKvEnabled()) await kvSetJSON(KEY.token(token), data);
  return token;
}

/** Token eenmalig inwisselen → e-mailadres (of null bij ongeldig/verlopen). */
async function consumeToken(token: string): Promise<string | null> {
  let data = memTokens.get(token) ?? null;
  if (!data && isKvEnabled()) data = await kvGetJSON<TokenData>(KEY.token(token));
  if (!data) return null;
  memTokens.delete(token);
  if (isKvEnabled()) await kvDel(KEY.token(token));
  return data.exp < Date.now() ? null : data.email;
}

export const createVerifyToken = (email: string) => createToken(email, VERIFY_TTL);
export const createMagicToken = (email: string) => createToken(email, MAGIC_TTL);
export const createResetToken = (email: string) => createToken(email, RESET_TTL);
export const consumeAuthToken = consumeToken;
