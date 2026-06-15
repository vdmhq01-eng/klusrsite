import { NextResponse } from "next/server";
import { getProductById } from "@/lib/data";
import { complete } from "@/lib/ai/client";

/**
 * AI content generation endpoint for the KLUSR admin.
 *
 * IMPORTANT — GOVERNANCE:
 * AI may only SUGGEST product content (description, specifications, FAQ, SEO).
 * Sensitive fields such as PRICE, STOCK and PAYMENT information must NEVER be
 * generated or auto-applied here. This route deliberately reads product data
 * for context only and never returns or mutates pricing/stock. A human always
 * approves the suggestion in the admin UI before it could ever be published.
 */

export const runtime = "nodejs";

type ContentType = "description" | "specifications" | "faqs" | "seo";

const VALID_TYPES: ContentType[] = ["description", "specifications", "faqs", "seo"];

interface GenerateBody {
  productId?: string;
  type?: ContentType;
  title?: string;
  brand?: string;
  category?: string;
}

const SYSTEM_PROMPT = `Je bent een ervaren Nederlandstalige webshop-copywriter voor KLUSR, een verfspeciaalzaak en lichte bouwmarkt met advies van ex-schilders. Schrijf in helder, wervend maar eerlijk Nederlands (je-vorm). Wees concreet en praktisch, gericht op doe-het-zelvers en klussers. Verzin GEEN prijzen, voorraad, kortingen of betaalinformatie — die velden worden nooit door AI ingevuld. Verzin geen exacte technische claims die je niet kunt onderbouwen; blijf bij plausibele, gangbare eigenschappen voor dit type product.`;

export async function POST(request: Request) {
  try {
    let body: GenerateBody;
    try {
      body = (await request.json()) as GenerateBody;
    } catch {
      return NextResponse.json(
        { error: "Ongeldige JSON in request body." },
        { status: 400 },
      );
    }

    const type = body.type;
    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Ongeldig 'type'. Kies uit: ${VALID_TYPES.join(", ")}.` },
        { status: 400 },
      );
    }

    const product = body.productId ? getProductById(body.productId) : undefined;

    const title = (product?.title ?? body.title ?? "dit product").trim();
    const brand = (product?.brand ?? body.brand ?? "").trim();
    const category = (product?.category ?? body.category ?? "").trim();

    const productLabel = [brand, title].filter(Boolean).join(" ");
    const context = [
      `Productnaam: ${title}`,
      brand ? `Merk: ${brand}` : null,
      category ? `Categorie: ${category}` : null,
      product?.highlights?.length
        ? `Bestaande pluspunten: ${product.highlights.join("; ")}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    const { prompt, mock } = buildPromptAndMock(type, { productLabel, title, brand, context });

    const { text, source } = await complete({
      system: SYSTEM_PROMPT,
      prompt,
      maxTokens: 900,
      temperature: 0.7,
      mock,
    });

    return NextResponse.json({ content: text, source });
  } catch (err) {
    console.error("[ai/generate-content] failed", err);
    return NextResponse.json(
      { error: "Er ging iets mis bij het genereren van de content." },
      { status: 500 },
    );
  }
}

interface PromptCtx {
  productLabel: string;
  title: string;
  brand: string;
  context: string;
}

function buildPromptAndMock(
  type: ContentType,
  { productLabel, title, brand, context }: PromptCtx,
): { prompt: string; mock: string } {
  const label = productLabel || title;

  switch (type) {
    case "description":
      return {
        prompt: `${context}\n\nSchrijf een wervende productbeschrijving voor de webshop van 2 korte alinea's (samen 60-110 woorden) voor "${label}". Benoem waarvoor het product geschikt is, de belangrijkste voordelen en een praktische verwerkingstip. Geen koppen, geen opsommingstekens, geen prijzen.`,
        mock: `${label} is een betrouwbare keuze voor klussers die een professioneel resultaat willen. Het product is eenvoudig te verwerken, gaat lang mee en levert een strak, duurzaam eindresultaat — precies wat je van KLUSR mag verwachten.\n\nDankzij de fijne verwerking werk je snel en netjes, ook als je minder ervaring hebt. Twijfel je over de aanpak of het juiste gereedschap? Onze ex-schilders helpen je graag in de winkel of via de klushulp.`,
      };

    case "specifications":
      return {
        prompt: `${context}\n\nGenereer een overzichtelijke lijst met plausibele technische specificaties voor "${label}". Geef 6-9 regels in het formaat "Label: Waarde" (elk op een nieuwe regel). Denk aan eigenschappen als toepassing, ondergrond, glansgraad of materiaal, rendement/verbruik, droogtijd, verdunnen, gereedschap en inhoud-eenheid. Geen prijzen of voorraad.`,
        mock: `Toepassing: Binnen en buiten, voor de geschikte ondergrond\nOndergrond: Schoon, droog en stofvrij\nVerwerkingstemperatuur: 10 - 25 °C\nRendement: Circa 8 - 10 m² per liter per laag\nDroogtijd stofdroog: 30 - 60 minuten\nOverschilderbaar: Na 4 - 6 uur\nVerdunnen: Met water, indien nodig max. 5%\nGereedschap: Roller, kwast of spuit\nReiniging gereedschap: Direct met water`,
      };

    case "faqs":
      return {
        prompt: `${context}\n\nSchrijf 3 tot 4 veelgestelde vragen met antwoord voor "${label}". Formatteer elke vraag op een regel beginnend met "V:" en het antwoord op de volgende regel beginnend met "A:". Houd antwoorden kort (1-3 zinnen), praktisch en eerlijk. Geen prijzen, voorraad of betaalinformatie.`,
        mock: `V: Hoeveel lagen heb ik nodig?\nA: Op een egale, voorbehandelde ondergrond zijn meestal twee lagen voldoende. Bij een sterke kleurovergang of poreuze ondergrond kan een extra laag nodig zijn.\n\nV: Hoe bereid ik de ondergrond voor?\nA: Zorg dat de ondergrond schoon, droog, vet- en stofvrij is. Schuur glanzende delen licht op en gebruik bij twijfel een geschikte primer.\n\nV: Welk gereedschap kan ik het beste gebruiken?\nA: Voor grote vlakken werk je het snelst met een roller; voor randen en hoeken gebruik je een kwast. Reinig je gereedschap direct na gebruik.\n\nV: Kan ik het product binnen gebruiken?\nA: Ja, mits je voor voldoende ventilatie zorgt. Houd ramen open tijdens en na het aanbrengen tot de geur volledig is verdwenen.`,
      };

    case "seo":
    default:
      return {
        prompt: `${context}\n\nGenereer SEO-content voor de productpagina van "${label}". Lever exact dit formaat:\nMeta titel: <max 60 tekens, met merk indien beschikbaar>\nMeta beschrijving: <140-155 tekens, wervend, met een reden om bij KLUSR te kopen>\nSEO-tekst: <1 alinea van 40-70 woorden met relevante zoekwoorden, natuurlijk geschreven>\nGeen prijzen of voorraadinformatie.`,
        mock: `Meta titel: ${truncate(`${label} kopen`, 57)} | KLUSR\nMeta beschrijving: ${label} eenvoudig online kopen bij KLUSR. Professionele kwaliteit, advies van ex-schilders en voor 16:00 besteld is morgen in huis.\nSEO-tekst: Op zoek naar ${label}? Bij KLUSR vind je een ruim assortiment${brand ? ` van ${brand}` : ""} voor een professioneel klusresultaat. Profiteer van deskundig advies van ex-schilders, scherpe Kluspas-voordelen en snelle levering. Bestel vandaag en klus als een pro.`,
      };
  }
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;
}
