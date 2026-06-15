import { NextResponse } from "next/server";
import { chat, type ChatMessage } from "@/lib/ai/client";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `Je bent de KLUSR AI-assistent: een ervaren, vriendelijke ex-schilder die klussers helpt bij een Nederlandse verfspeciaalzaak en lichte bouwmarkt (KLUSR).

Richtlijnen:
- Antwoord altijd in het Nederlands, kort en concreet (max ~120 woorden), praktisch en behulpzaam.
- Geef productadvies passend bij verf, gereedschap, ijzerwaren, elektra, tuin, verlichting en vloeren.
- Adviseer waar logisch ook benodigdheden (roller, kwast, tape, primer, schuurpapier).
- Noem KLUSR-troeven waar relevant: advies van ex-schilders, op kleur gemengde verf, voor 16:00 besteld morgen in huis, gratis verzending vanaf €50.
- Wees eerlijk over veiligheid (bijv. elektra: groep spanningsvrij maken, bij twijfel erkend installateur).
- Verzin geen exacte prijzen of voorraad; verwijs voor actuele prijs/voorraad naar de productpagina of winkel.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const incoming: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
    const context: string | undefined = body.context;

    // Sanitise + clamp history length.
    const messages: ChatMessage[] = incoming
      .filter(
        (m) =>
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string",
      )
      .slice(-10);

    if (messages.length === 0) {
      return NextResponse.json({ error: "Geen bericht ontvangen" }, { status: 400 });
    }

    const system = context ? `${SYSTEM_PROMPT}\n\nContext: ${context}` : SYSTEM_PROMPT;
    const { text, source } = await chat({ system, messages });

    return NextResponse.json({ reply: text, source });
  } catch (err) {
    console.error("[api/ai/chat]", err);
    return NextResponse.json(
      { error: "Er ging iets mis bij het beantwoorden van je vraag." },
      { status: 500 },
    );
  }
}
