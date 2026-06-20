import { NextResponse } from "next/server";
import { complete } from "@/lib/ai/client";
import { getProductById } from "@/lib/data/products";

export const runtime = "nodejs";

/**
 * Product-specific advice for the "Twijfel je of dit de juiste verf is?" block
 * on the PDP. Accepts { productId, question }.
 */
export async function POST(req: Request) {
  try {
    const { productId, question } = await req.json();
    const product = productId ? getProductById(productId) : undefined;

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Geen vraag ontvangen" }, { status: 400 });
    }

    const productContext = product
      ? `Product: ${product.brand} ${product.title}. Eigenschappen: ${product.highlights.join(
          ", ",
        )}. Categorie: ${product.category}${
          product.subCategory ? ` / ${product.subCategory}` : ""
        }.`
      : "Geen specifiek product geselecteerd.";

    const mock = product
      ? `De ${product.title} is een goede keuze voor ${
          product.subCategory ?? product.category
        }. ${product.highlights[0]?.toLowerCase() ?? "Hoge kwaliteit"} en eenvoudig te verwerken. Combineer met het juiste gereedschap voor het beste resultaat. Twijfel je over de hoeveelheid of kleur? Vraag gerust verder of neem contact op met de klantenservice voor advies van onze ex-schilders.`
      : "Vertel me wat je precies gaat doen, dan adviseer ik je graag over de juiste verf en benodigdheden.";

    const { text, source } = await complete({
      system: `Je bent een ervaren ex-schilder die bij KLUSR (NL verfspeciaalzaak) productadvies geeft. Antwoord in het Nederlands, kort (max ~100 woorden), concreet en eerlijk. Geef geen exacte prijzen of voorraad.`,
      prompt: `${productContext}\n\nKlantvraag: ${question}\n\nGeef passend, praktisch advies.`,
      maxTokens: 400,
      mock,
    });

    return NextResponse.json({ advice: text, source });
  } catch (err) {
    console.error("[api/ai/product-advice]", err);
    return NextResponse.json({ error: "Er ging iets mis." }, { status: 500 });
  }
}
