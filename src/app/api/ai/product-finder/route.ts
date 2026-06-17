import { NextResponse } from "next/server";
import { complete } from "@/lib/ai/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Product-finder: vertaalt een vrije klusvraag ("verf voor mijn houten kozijnen
 * buiten") naar filterkeuzes binnen de huidige categorie. Gebruikt Claude; valt
 * zonder sleutel terug op een trefwoord-heuristiek. Geeft alleen filters terug
 * die ook echt in de aangeboden opties voorkomen.
 */

interface FacetOption {
  key: string;
  title: string;
  values: { id: string; label: string }[];
}
interface Options {
  subCategories?: string[];
  brands?: string[];
  attrs?: FacetOption[];
}
interface Selections {
  attrs: Record<string, string[]>;
  subCategories: string[];
  brands: string[];
}

const empty = (): Selections => ({ attrs: {}, subCategories: [], brands: [] });

/** Pak het eerste JSON-object uit een tekst (model kan tekst eromheen zetten). */
function safeParse(text: string): Record<string, unknown> | null {
  if (!text) return null;
  const a = text.indexOf("{");
  const b = text.lastIndexOf("}");
  if (a < 0 || b <= a) return null;
  try {
    return JSON.parse(text.slice(a, b + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Heuristische terugval: matcht trefwoorden uit de vraag op de optie-labels. */
function heuristic(query: string, opts: Options): Selections {
  const q = ` ${query.toLowerCase()} `;
  const has = (s: string) => s.length > 2 && q.includes(s.toLowerCase());
  const sel = empty();
  for (const f of opts.attrs ?? []) {
    const ids = f.values.filter((v) => has(v.label) || has(v.id)).map((v) => v.id);
    if (ids.length) sel.attrs[f.key] = ids;
  }
  sel.subCategories = (opts.subCategories ?? []).filter((s) => has(s));
  sel.brands = (opts.brands ?? []).filter((b) => has(b));
  return sel;
}

/** Houd alleen filters die echt bestaan in de aangeboden opties. */
function validate(parsed: Record<string, unknown> | null, opts: Options): Selections {
  const sel = empty();
  if (!parsed) return sel;
  const subSet = new Set(opts.subCategories ?? []);
  const brandSet = new Set(opts.brands ?? []);
  const attrSets = new Map((opts.attrs ?? []).map((f) => [f.key, new Set(f.values.map((v) => v.id))]));

  const arr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

  sel.subCategories = arr((parsed as { subCategories?: unknown }).subCategories).filter((s) => subSet.has(s));
  sel.brands = arr((parsed as { brands?: unknown }).brands).filter((b) => brandSet.has(b));
  const attrs = (parsed as { attrs?: unknown }).attrs;
  if (attrs && typeof attrs === "object") {
    for (const [key, vals] of Object.entries(attrs as Record<string, unknown>)) {
      const allowed = attrSets.get(key);
      if (!allowed) continue;
      const ids = arr(vals).filter((id) => allowed.has(id));
      if (ids.length) sel.attrs[key] = ids;
    }
  }
  return sel;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      query?: string;
      category?: string;
      options?: Options;
    };
    const query = (body.query || "").trim().slice(0, 300);
    if (!query) return NextResponse.json({ selections: empty(), summary: "" });
    const opts = body.options || {};

    const optionsText = JSON.stringify({
      productsoorten: opts.subCategories ?? [],
      merken: opts.brands ?? [],
      kenmerken: (opts.attrs ?? []).map((f) => ({
        key: f.key,
        titel: f.title,
        waarden: f.values.map((v) => ({ id: v.id, label: v.label })),
      })),
    });

    const system =
      "Je bent de productzoeker van KLUSR, een Nederlandse verf- en doe-het-zelfwinkel met advies van ex-schilders. " +
      "Kies op basis van de klusvraag de best passende filters UIT de aangeboden opties. Gebruik uitsluitend ids/waarden " +
      "die letterlijk in de opties staan — verzin niets. Kies liever weinig, scherpe filters dan veel. Antwoord UITSLUITEND met geldige JSON.";

    const prompt =
      `Categorie: ${body.category || "producten"}\n` +
      `Vraag van de klant: "${query}"\n\n` +
      `Beschikbare filters (gebruik exact deze ids/waarden):\n${optionsText}\n\n` +
      `Geef JSON in precies dit formaat:\n` +
      `{"attrs":{"<kenmerk-key>":["<waarde-id>"]},"subCategories":["<productsoort>"],"brands":["<merk>"],"summary":"<één korte Nederlandse zin: waarop heb je gefilterd>"}\n` +
      `Laat een veld leeg ([]) als het niet relevant is.`;

    const { text } = await complete({ system, prompt, maxTokens: 500, temperature: 0.2, mock: "" });
    const parsed = safeParse(text);
    const selections = parsed ? validate(parsed, opts) : heuristic(query, opts);
    const summaryRaw =
      parsed && typeof (parsed as { summary?: unknown }).summary === "string"
        ? ((parsed as { summary: string }).summary)
        : "";
    return NextResponse.json({ selections, summary: summaryRaw.slice(0, 200) });
  } catch (err) {
    console.error("[api/ai/product-finder]", err);
    return NextResponse.json({ selections: empty(), summary: "" });
  }
}
