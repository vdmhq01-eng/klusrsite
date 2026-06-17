import { NextResponse } from "next/server";
import { getProductById } from "@/lib/data";
import {
  VALID_CONTENT_TYPES,
  buildContentPrompt,
  toContentContext,
  type ContentType,
} from "@/lib/ai/content";
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
 *
 * The prompt-building + Anthropic call live in `src/lib/ai/content.ts` so the
 * background worker (`/api/cron/generate-content`) reuses the exact same logic.
 */

export const runtime = "nodejs";

const VALID_TYPES: ContentType[] = VALID_CONTENT_TYPES;

interface GenerateBody {
  productId?: string;
  type?: ContentType;
  title?: string;
  brand?: string;
  category?: string;
}

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

    const ctx = toContentContext({
      title: product?.title ?? body.title ?? "dit product",
      brand: product?.brand ?? body.brand ?? "",
      category: product?.category ?? body.category ?? "",
      highlights: product?.highlights,
    });

    const { system, prompt, mock } = buildContentPrompt(type, ctx);

    const { text, source } = await complete({
      system,
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
