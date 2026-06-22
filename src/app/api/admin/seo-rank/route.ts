import { NextResponse } from "next/server";
import { getAdminSession } from "@/auth";
import {
  DEFAULT_KEYWORDS,
  checkKeywordRanks,
  isSeoRankConfigured,
} from "@/lib/seo-rank";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Admin: SEO-rankingcheck. GET geeft de standaard-zoekwoorden + of er een live
 * SERP-bron is geconfigureerd; POST { keywords } draait de check en geeft per
 * zoekwoord de positie + de rankende pagina terug.
 */
export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    configured: isSeoRankConfigured(),
    keywords: DEFAULT_KEYWORDS,
  });
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { keywords?: unknown };
  let keywords = Array.isArray(body.keywords)
    ? body.keywords.filter((k): k is string => typeof k === "string" && k.trim().length > 0).map((k) => k.trim())
    : [];
  if (keywords.length === 0) keywords = DEFAULT_KEYWORDS;
  // Dedupe + begrens (SERP-calls kosten geld/tijd).
  keywords = Array.from(new Set(keywords)).slice(0, 20);

  const results = await checkKeywordRanks(keywords, 4);
  return NextResponse.json({ configured: isSeoRankConfigured(), results });
}
