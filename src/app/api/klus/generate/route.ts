import { NextResponse } from "next/server";
import { complete } from "@/lib/ai/client";
import { getSession } from "@/auth";
import { searchProducts } from "@/lib/data/products";
import { createKlus, type KlusItem } from "@/lib/store/klus";
import { logEvent } from "@/lib/store/analytics";

export const runtime = "nodejs";

/**
 * Stelt op basis van een klusomschrijving een "kluspakket" samen: een lijst met
 * échte catalogusproducten (met aantallen) die je voor de klus nodig hebt.
 *
 * Grounding (belangrijk): de Klushulp mag GEEN product-id's verzinnen. We vragen
 * het model daarom enkel om *zoektermen* + aantallen; serverside resolven we elke
 * zoekterm naar een echt product via `searchProducts`. Zo bestaat elk artikel op
 * de pagina gegarandeerd in de catalogus. Zonder AI-sleutel (mock) of bij een
 * onleesbaar antwoord valt het terug op een deterministische trefwoord-mapping.
 * De route gooit nooit een 500: hij degradeert netjes.
 */

const SYSTEM_PROMPT = `Je bent de KLUSR Klushulp: een ervaren ex-schilder die klussers helpt bij een Nederlandse verfspeciaalzaak en lichte bouwmarkt (KLUSR). Je stelt een "kluspakket" samen: de benodigdheden voor een klus.

Belangrijk: je kent de exacte producten in de catalogus NIET. Geef daarom per benodigdheid een concrete, generieke ZOEKTERM (bijv. "muurverf", "afplaktape", "verfroller", "grondverf primer", "behanglijm", "laminaat", "ondervloer") en een realistisch aantal. Verzin geen merknamen of artikelnummers.

Antwoord UITSLUITEND met geldige JSON in exact deze vorm, zonder extra tekst, uitleg of codeblok-markering:
{"title":"<korte kluspakket-titel>","intro":"<1-2 zinnen, vriendelijk en praktisch>","items":[{"search":"<concrete productzoekterm>","quantity":<geheel getal>,"reason":"<korte reden, max ~8 woorden>"}]}

Richtlijnen:
- Geef 4 tot 8 items: de verf/het hoofdmateriaal én het bijbehorende gereedschap (roller, kwast, tape, primer, schuurpapier, afdekfolie waar logisch).
- Houd zoektermen kort en generiek zodat ze in een assortiment te vinden zijn.
- Schrijf title, intro en reason in het Nederlands.`;

/** Per klustype een set zoektermen als terugval (mock / onleesbaar AI-antwoord). */
const FALLBACK_NEEDS: { re: RegExp; title: string; needs: string[] }[] = [
  {
    re: /verf|verv|schilder|muur|latex|saus|plafond/,
    title: "Kluspakket muur schilderen",
    needs: ["muurverf", "grondverf primer", "afplaktape", "verfroller", "kwast", "afdekfolie"],
  },
  {
    re: /kozijn|\blak\b|houtwerk|deur/,
    title: "Kluspakket houtwerk lakken",
    needs: ["lak", "grondverf primer", "schuurpapier", "kwast", "afplaktape"],
  },
  {
    re: /behang|behangen|vlies/,
    title: "Kluspakket behangen",
    needs: ["behang", "behanglijm", "behangkwast", "naadroller"],
  },
  {
    re: /vloer|laminaat|\bpvc\b|parket|ondervloer/,
    title: "Kluspakket vloer leggen",
    needs: ["laminaat", "ondervloer", "plinten"],
  },
  {
    re: /beits|schutting|tuinhout|buitenhout|tuin|terras/,
    title: "Kluspakket tuinhout",
    needs: ["beits", "kwast", "tuinhandschoenen"],
  },
  {
    re: /stopcontact|elektra|schakelaar|\bgroep\b|bekabel|kabel/,
    title: "Kluspakket elektra",
    needs: ["stopcontact", "schroevendraaier"],
  },
];

const DEFAULT_FALLBACK: { title: string; needs: string[] } = {
  title: "Kluspakket gereedschap",
  needs: ["schroevendraaier", "boormachine", "schuurpapier", "afplaktape", "kwast"],
};

interface AiItem {
  search?: unknown;
  quantity?: unknown;
  reason?: unknown;
}
interface AiPakket {
  title?: unknown;
  intro?: unknown;
  items?: unknown;
}

/** Pak het eerste {...}-blok uit een (mogelijk omwikkeld) modelantwoord en parse het. */
function parseJsonBlock(text: string): AiPakket | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as AiPakket;
  } catch {
    return null;
  }
}

/** Maak een redelijk aantal van een onbekende waarde (1–20, default 1). */
function toQuantity(value: unknown): number {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, 20);
}

/**
 * Resolve {search, quantity, reason}-needs naar échte catalogusproducten en
 * dedupliceer op productId (aantallen optellen). Needs die niets opleveren
 * vallen weg, zodat elk artikel gegarandeerd bestaat.
 */
function resolveNeeds(
  needs: { search: string; quantity: number; reason?: string }[],
): KlusItem[] {
  const byProduct = new Map<string, KlusItem>();
  for (const need of needs) {
    const term = need.search.trim();
    if (!term) continue;
    const product = searchProducts(term, 1)[0];
    if (!product) continue;
    const existing = byProduct.get(product.id);
    if (existing) {
      existing.quantity += need.quantity;
    } else {
      byProduct.set(product.id, {
        productId: product.id,
        quantity: need.quantity,
        reason: need.reason,
      });
    }
  }
  return [...byProduct.values()];
}

/** Bouw een deterministisch kluspakket uit de trefwoord-mapping. */
function buildFallback(query: string): { title: string; intro: string; items: KlusItem[] } {
  const q = query.toLowerCase();
  const match = FALLBACK_NEEDS.find((f) => f.re.test(q)) ?? DEFAULT_FALLBACK;
  const items = resolveNeeds(match.needs.map((search) => ({ search, quantity: 1 })));
  const intro =
    "Op basis van je klus hebben we een kluspakket samengesteld met de benodigde producten en het juiste gereedschap. Pas de aantallen gerust aan in de winkelwagen.";
  return { title: match.title, intro, items };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // De klusomschrijving: expliciet meegegeven, of afgeleid uit de chathistorie
    // (alle klantberichten aan elkaar).
    let query = typeof body.query === "string" ? body.query.trim() : "";
    if (!query && Array.isArray(body.messages)) {
      const messages = body.messages as unknown[];
      query = messages
        .filter(
          (m): m is { role: string; content: string } =>
            !!m &&
            typeof m === "object" &&
            (m as { role?: unknown }).role === "user" &&
            typeof (m as { content?: unknown }).content === "string",
        )
        .map((m) => m.content.trim())
        .filter(Boolean)
        .join("\n");
    }
    query = query.slice(0, 2000);

    if (!query) {
      return NextResponse.json(
        { error: "Vertel eerst kort wat je gaat doen, dan stel ik je kluspakket samen." },
        { status: 400 },
      );
    }

    // 1) Vraag het model om needs (zoektermen + aantallen) als strikte JSON.
    const { text, source } = await complete({
      system: SYSTEM_PROMPT,
      prompt: `Stel een kluspakket samen voor deze klus:\n"${query}"`,
      maxTokens: 700,
      temperature: 0.4,
    });

    let title = "";
    let intro = "";
    let items: KlusItem[] = [];

    const parsed = source === "ai" ? parseJsonBlock(text) : null;
    if (parsed && Array.isArray(parsed.items)) {
      const needs = (parsed.items as AiItem[])
        .map((it) => ({
          search: typeof it.search === "string" ? it.search : "",
          quantity: toQuantity(it.quantity),
          reason: typeof it.reason === "string" ? it.reason : undefined,
        }))
        .filter((n) => n.search);
      items = resolveNeeds(needs);
      if (typeof parsed.title === "string") title = parsed.title.trim();
      if (typeof parsed.intro === "string") intro = parsed.intro.trim();
    }

    // 2) Terugval (mock, onleesbaar antwoord of niets gevonden): deterministische
    //    trefwoord-mapping. Zo komt er altijd een bruikbaar pakket uit.
    if (items.length === 0) {
      const fb = buildFallback(query);
      title = title || fb.title;
      intro = intro || fb.intro;
      items = fb.items;
    }

    // Mocht zelfs de terugval niets vinden (zeer uitzonderlijk), val terug op het
    // generieke gereedschapspakket.
    if (items.length === 0) {
      items = resolveNeeds(DEFAULT_FALLBACK.needs.map((search) => ({ search, quantity: 1 })));
      title = title || DEFAULT_FALLBACK.title;
    }

    if (!title) title = "Jouw kluspakket";

    // 3) Persisteer (met eigenaar als de klant is ingelogd) en geef de URL terug.
    const session = await getSession();
    const ownerEmail = session?.user?.email ?? undefined;
    const klus = await createKlus({ title, intro, query, items, ownerEmail });

    void logEvent("klus", { query: query.slice(0, 300), items: items.length, source }).catch(
      () => {},
    );

    return NextResponse.json({ id: klus.id, url: `/klus/${klus.id}` });
  } catch (err) {
    console.error("[api/klus/generate]", err);
    return NextResponse.json(
      { error: "Er ging iets mis bij het samenstellen van je kluspakket." },
      { status: 500 },
    );
  }
}
