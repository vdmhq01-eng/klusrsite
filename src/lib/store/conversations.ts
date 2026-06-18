import { isKvEnabled, kvGetJSON, kvSetJSON } from "./kv";
import { sendPushToAdmins } from "@/lib/push";

/**
 * Gespreksstore voor de website-chat ("de Klushulp"). Net als de orderstore
 * persistent via KV (Upstash/Vercel KV) met een in-memory Map als fallback.
 * Met KV blijven chatgesprekken bewaard tussen serverless-instances en deploys —
 * nodig zodat de admin ze in het "Gesprekken"-overzicht kan teruglezen. Zonder
 * KV draait alles in-memory binnen één serverinstance (demo-veilig).
 *
 * De AI ("de Klushulp") blijft de chats afhandelen; dit is read-only meelezen.
 * Alle calls zijn best-effort en gooien NOOIT, zodat de publieke chat niet kan
 * breken door een opslagfout.
 */

/** Eén bewaard bericht in een gesprek. */
export interface StoredMessage {
  role: "user" | "assistant";
  content: string;
  ts: string;
}

/** Een volledig bewaard chatgesprek. */
export interface StoredConversation {
  id: string;
  startedAt: string;
  updatedAt: string;
  messages: StoredMessage[];
  lastUserMessage: string;
  messageCount: number;
  page?: string;
}

/** Compacte index-entry voor de lijstweergave (nieuwste eerst). */
export interface ConversationIndexEntry {
  id: string;
  updatedAt: string;
  preview: string;
  messageCount: number;
}

const conversations = new Map<string, StoredConversation>();
/** In-memory spiegel van de index (nieuwste eerst) als KV uit is. */
let memIndex: ConversationIndexEntry[] = [];

const MAX_MESSAGES = 40;
const MAX_INDEX = 200;
const PREVIEW_LEN = 140;

const KEY = {
  conv: (id: string) => `chat:conv:${id}`,
  index: "chat:conv:index",
};

function previewOf(text: string): string {
  return text.trim().slice(0, PREVIEW_LEN);
}

/** Laad een gesprek op id: eerst in-memory cache, dan KV. */
async function loadById(id: string): Promise<StoredConversation | undefined> {
  const mem = conversations.get(id);
  if (mem) return mem;
  if (isKvEnabled()) {
    const kv = await kvGetJSON<StoredConversation>(KEY.conv(id));
    if (kv) {
      conversations.set(kv.id, kv);
      return kv;
    }
  }
  return undefined;
}

/** Lees de index (KV als aan, anders de in-memory spiegel). */
async function loadIndex(): Promise<ConversationIndexEntry[]> {
  if (isKvEnabled()) {
    const idx = await kvGetJSON<ConversationIndexEntry[]>(KEY.index);
    if (Array.isArray(idx)) return idx;
    return [];
  }
  return memIndex;
}

/** Zet de entry vooraan, dedupe op id en knip de index af. */
function upsertIndexEntry(
  index: ConversationIndexEntry[],
  entry: ConversationIndexEntry,
): ConversationIndexEntry[] {
  const rest = index.filter((e) => e.id !== entry.id);
  return [entry, ...rest].slice(0, MAX_INDEX);
}

export interface AppendTurnInput {
  userMessage: string;
  assistantReply: string;
  page?: string;
}

/**
 * Voeg één beurt (klantvraag + antwoord van de Klushulp) toe aan een gesprek.
 * Laadt-of-maakt het gesprek aan, knipt de berichten af op ~40, werkt de
 * metadata bij, schrijft weg naar KV (read-modify-write) en de index, en houdt
 * de in-memory cache up-to-date. Best-effort: faalt stil.
 */
export async function appendTurn(id: string, input: AppendTurnInput): Promise<void> {
  try {
    const cid = String(id).trim();
    if (!cid) return;

    const now = new Date().toISOString();
    const userMessage = String(input.userMessage ?? "");
    const assistantReply = String(input.assistantReply ?? "");

    const existing = await loadById(cid);
    // Een ontbrekend bestaand gesprek = dit is een NIEUW gesprek (eerste beurt).
    const isNewConversation = existing === undefined;
    const conv: StoredConversation = existing ?? {
      id: cid,
      startedAt: now,
      updatedAt: now,
      messages: [],
      lastUserMessage: "",
      messageCount: 0,
      page: input.page,
    };

    if (userMessage) conv.messages.push({ role: "user", content: userMessage, ts: now });
    conv.messages.push({ role: "assistant", content: assistantReply, ts: now });
    if (conv.messages.length > MAX_MESSAGES) {
      conv.messages = conv.messages.slice(-MAX_MESSAGES);
    }

    conv.updatedAt = now;
    conv.lastUserMessage = userMessage || conv.lastUserMessage;
    conv.messageCount = conv.messages.length;
    if (input.page) conv.page = input.page;

    // In-memory cache altijd bijwerken (demo-fallback + cache voor KV).
    conversations.set(conv.id, conv);

    const entry: ConversationIndexEntry = {
      id: conv.id,
      updatedAt: conv.updatedAt,
      preview: previewOf(conv.lastUserMessage),
      messageCount: conv.messageCount,
    };

    if (isKvEnabled()) {
      const index = await loadIndex();
      await kvSetJSON(KEY.conv(conv.id), conv);
      await kvSetJSON(KEY.index, upsertIndexEntry(index, entry));
    } else {
      memIndex = upsertIndexEntry(memIndex, entry);
    }

    // Alleen bij een NIEUW gesprek de beheerders een push sturen (niet bij elke
    // beurt — dat zou spammen). Best-effort en afgeschermd (gooit nooit).
    if (isNewConversation) {
      const preview = previewOf(userMessage) || "Nieuw chatbericht";
      void sendPushToAdmins({
        title: "Nieuw gesprek met de Klushulp",
        body: preview,
        url: "/admin",
      });
    }
  } catch (err) {
    console.error("[conversations] appendTurn failed", err);
  }
}

/** Recente gesprekken (index-entries), nieuwste eerst — voor het admin-overzicht. */
export async function listConversations(limit = 100): Promise<ConversationIndexEntry[]> {
  try {
    const index = await loadIndex();
    return index.slice(0, Math.max(0, limit));
  } catch (err) {
    console.error("[conversations] listConversations failed", err);
    return [];
  }
}

/** Eén volledig gesprek op id, of null als het niet bestaat. */
export async function getConversation(id: string): Promise<StoredConversation | null> {
  try {
    const cid = String(id).trim();
    if (!cid) return null;
    return (await loadById(cid)) ?? null;
  } catch (err) {
    console.error("[conversations] getConversation failed", err);
    return null;
  }
}
