import Anthropic from "@anthropic-ai/sdk";

/**
 * Thin wrapper around the Anthropic (Claude) SDK.
 *
 * The whole app degrades gracefully: when ANTHROPIC_API_KEY is absent every
 * helper returns a sensible mock so the shop stays fully functional in demo
 * mode without secrets.
 */

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

let client: Anthropic | null = null;

export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function getClient(): Anthropic | null {
  if (!isAiConfigured()) return null;
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export interface CompleteOptions {
  system?: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  /** Used to produce a deterministic mock when AI is not configured. */
  mock?: string;
}

/**
 * Single-turn completion. Returns the assistant text, or the provided mock /
 * a generic fallback when AI is not configured or the call fails.
 */
export async function complete({
  system,
  prompt,
  maxTokens = 1024,
  temperature = 0.7,
  mock,
}: CompleteOptions): Promise<{ text: string; source: "ai" | "mock" }> {
  const anthropic = getClient();
  if (!anthropic) {
    return { text: mock ?? defaultMock, source: "mock" };
  }

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: maxTokens,
      temperature,
      system,
      messages: [{ role: "user", content: prompt }],
    });
    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    return { text: text || (mock ?? defaultMock), source: "ai" };
  } catch (err) {
    console.error("[ai] completion failed", err);
    return { text: mock ?? defaultMock, source: "mock" };
  }
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Multi-turn chat for the KLUSR assistant. Falls back to a heuristic reply
 * (see buildHeuristicReply) when AI is not configured.
 */
export async function chat({
  system,
  messages,
  maxTokens = 800,
}: {
  system?: string;
  messages: ChatMessage[];
  maxTokens?: number;
}): Promise<{ text: string; source: "ai" | "mock" }> {
  const anthropic = getClient();
  const lastUser = [...messages].reverse().find((m) => m.role === "user");

  if (!anthropic) {
    return { text: buildHeuristicReply(lastUser?.content ?? ""), source: "mock" };
  }

  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: maxTokens,
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });
    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    return { text, source: "ai" };
  } catch (err) {
    console.error("[ai] chat failed", err);
    return { text: buildHeuristicReply(lastUser?.content ?? ""), source: "mock" };
  }
}

const defaultMock =
  "Op basis van je klus adviseren we te beginnen met een goede voorbereiding en het juiste gereedschap. Vraag gerust naar advies van onze ex-schilders via de klantenservice.";

/** Lightweight keyword-based fallback so the chat always feels responsive. */
export function buildHeuristicReply(question: string): string {
  const q = question.toLowerCase();

  if (q.includes("muur") || q.includes("verf")) {
    return "Voor het verven van een muur adviseren we een matte muurverf zoals de Sikkens Alpha Pure Mat of Flexa Creations. Reken op circa 8-10 m² per liter per laag. Combineer met een Anza Silver roller en FrogTape voor strakke randen. Wil je een specifieke kleur? Gebruik onze kleurkiezer.";
  }
  if (q.includes("kozijn") || q.includes("lak") || q.includes("hout")) {
    return "Voor kozijnen en houtwerk raden we een watergedragen PU-lak aan, zoals de Sigma Contour Aqua PU. Schuur het hout licht op, ontvet het en breng eerst een multiprimer aan. Gebruik een synthetische kwast voor de mooiste afgifte.";
  }
  if (q.includes("beits") || q.includes("schutting") || q.includes("tuin")) {
    return "Voor tuinhout is een dekkende of transparante beits ideaal. De Hermadix Tuinhoutbeits beschermt langdurig tegen weer en wind. Zorg dat het hout droog en schoon is en breng twee dunne lagen aan in de richting van de nerf.";
  }
  if (q.includes("rol") || q.includes("kwast")) {
    return "Voor muren en plafonds werk je het snelst met een roller met korte pool (8-12 mm). Voor lak en beits gebruik je een synthetische kwast. Onze Anza Pro kwastset is een veelzijdige keuze.";
  }
  if (q.includes("stopcontact") || q.includes("elektra")) {
    return "Een stopcontact vervangen kun je zelf, mits je de groep eerst spanningsvrij maakt en controleert met een spanningzoeker. Twijfel je over de bedrading? Schakel dan een erkend installateur in.";
  }
  return "Goede vraag! Vertel me wat je precies gaat doen — bijvoorbeeld een muur verven, kozijnen schilderen of je tuin opknappen — dan geef ik je een passend advies en de juiste producten.";
}

export { DEFAULT_MODEL };
