import { NextResponse } from "next/server";
import { chat, type ChatMessage } from "@/lib/ai/client";
import { logEvent } from "@/lib/store/analytics";
import { appendTurn } from "@/lib/store/conversations";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `Je bent de KLUSR Klushulp: een ervaren, vriendelijke ex-schilder die klussers helpt bij een Nederlandse verfspeciaalzaak en lichte bouwmarkt (KLUSR).

Richtlijnen:
- Presenteer je als "de Klushulp" / de ex-schilders van KLUSR. Gebruik het woord "AI" niet.
- Antwoord altijd in het Nederlands, kort en concreet (max ~120 woorden), praktisch en behulpzaam.
- Geef productadvies passend bij verf, gereedschap, ijzerwaren, elektra, tuin, verlichting en vloeren.
- Adviseer waar logisch ook benodigdheden (roller, kwast, tape, primer, schuurpapier).
- Noem KLUSR-troeven waar relevant: advies van ex-schilders, op kleur gemengde verf, voor 19:00 besteld morgen in huis, gratis verzending vanaf €50.
- Wees eerlijk over veiligheid (bijv. elektra: groep spanningsvrij maken, bij twijfel erkend installateur).
- Verzin geen exacte prijzen of voorraad; verwijs voor actuele prijs/voorraad naar de productpagina. KLUSR is volledig online (geen fysieke winkels); verwijs voor persoonlijk advies naar de klantenservice.
- Sluit je antwoord ALTIJD af met een aparte laatste regel: "[[SUGGESTIES]]" gevolgd door 2 à 3 korte vervolgvragen die de klant zélf zou kunnen stellen, gescheiden door " | ". Voorbeeld: [[SUGGESTIES]] Welk gereedschap heb ik nodig? | Hoeveel liter heb ik nodig? | Welke primer gebruik ik?`;

/** Haal de [[SUGGESTIES]]-regel uit het antwoord en geef ze los terug. */
function extractSuggestions(text: string): { reply: string; suggestions: string[] } {
  const m = text.match(/\[\[SUGGESTIES\]\]([\s\S]+)$/i);
  if (!m) return { reply: text.trim(), suggestions: [] };
  const suggestions = m[1]
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);
  return { reply: text.slice(0, m.index).trim(), suggestions };
}

const TOPIC_LINKS: { re: RegExp; href: string; label: string }[] = [
  { re: /stopcontact|elektra|schakelaar|spanning|\bgroep\b|bekabel|kabel/, href: "/categorie/elektra", label: "Bekijk elektra-producten" },
  { re: /verlichting|\blamp|\bled\b|spot|armatuur/, href: "/categorie/verlichting", label: "Bekijk verlichting" },
  { re: /vloer|laminaat|\bpvc\b|parket|ondervloer|gordijn|raamdecoratie/, href: "/categorie/vloeren-raam", label: "Bekijk vloeren & raam" },
  { re: /\btuin\b|terras|schutting|tuinhout|gazon|buitenhout/, href: "/categorie/tuin", label: "Bekijk tuin-producten" },
  { re: /schroef|\bplug|\bbout|beslag|scharnier|ijzerwaren|\bslot\b/, href: "/categorie/ijzerwaren", label: "Bekijk ijzerwaren" },
  { re: /rol(?:ler)?|kwast|\btape\b|schuur|gereedschap|\bboor|\bzaag|plamuurmes|verfbak/, href: "/categorie/gereedschap", label: "Bekijk het gereedschap" },
  { re: /muur|latex|plafond|\blak\b|kozijn|\bhout\b|beits|primer|grondverf|\bverf\b|sausen|saus\b/, href: "/categorie/verf", label: "Bekijk de aanbevolen verf" },
];

/** Leid een passende categorie-CTA af uit de vraag + het antwoord. */
function deriveProductLink(userMsg: string, reply: string): { productHref: string; productLabel: string } {
  const hay = `${userMsg} ${reply}`.toLowerCase();
  for (const l of TOPIC_LINKS) if (l.re.test(hay)) return { productHref: l.href, productLabel: l.label };
  return { productHref: "/categorie/verf", productLabel: "Bekijk ons assortiment" };
}

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

    // Registreer de laatste klantvraag (analytics — best-effort).
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser?.content) {
      void logEvent("chat", { question: lastUser.content.slice(0, 300) }).catch(() => {});
    }

    const system = context ? `${SYSTEM_PROMPT}\n\nContext: ${context}` : SYSTEM_PROMPT;
    const { text, source } = await chat({ system, messages });

    const { reply, suggestions } = extractSuggestions(text);
    const { productHref, productLabel } = deriveProductLink(lastUser?.content ?? "", reply);

    // Bewaar de beurt zodat de admin het gesprek kan teruglezen — best-effort en
    // volledig afgeschermd zodat opslag de chatrespons NOOIT kan breken.
    const conversationId = typeof body.conversationId === "string" ? body.conversationId.trim() : "";
    if (conversationId) {
      const page = typeof body.page === "string" ? body.page : undefined;
      void appendTurn(conversationId, {
        userMessage: lastUser?.content ?? "",
        assistantReply: reply,
        page,
      }).catch(() => {});
    }

    return NextResponse.json({ reply, suggestions, productHref, productLabel, source });
  } catch (err) {
    console.error("[api/ai/chat]", err);
    return NextResponse.json(
      { error: "Er ging iets mis bij het beantwoorden van je vraag." },
      { status: 500 },
    );
  }
}
