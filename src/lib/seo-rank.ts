/**
 * SEO-rankingcheck: zoekt per relevant zoekwoord de positie van klus-r.nl in de
 * Google-resultaten (en wélke pagina rankt). Gebruikt SerpApi wanneer
 * `SERPAPI_KEY` is gezet; zonder sleutel draait het in demo (deterministische
 * voorbeelddata) zodat de admin-weergave altijd werkt. Google heeft geen gratis
 * rank-API en scrapen is tegen hun voorwaarden — vandaar een SERP-API.
 */

const SITE_DOMAIN = "klus-r.nl";
const SERPAPI_KEY = process.env.SERPAPI_KEY;

export interface KeywordRank {
  keyword: string;
  /** Positie in de organische resultaten, of null als niet gevonden in de top. */
  position: number | null;
  /** De rankende pagina (URL) op klus-r.nl. */
  url?: string;
  title?: string;
  source: "serpapi" | "mock";
}

export function isSeoRankConfigured(): boolean {
  return Boolean(SERPAPI_KEY);
}

/** Curated, relevante zoekwoorden voor KLUSR (verfspeciaalzaak + lichte bouwmarkt). */
export const DEFAULT_KEYWORDS = [
  "verf op kleur laten mengen",
  "muurverf kopen",
  "sikkens verf kopen",
  "histor verf",
  "trapverf",
  "kleur laten mengen verf",
  "ral kleur verf",
  "grondverf hout",
  "betonverf kopen",
  "verfwinkel online",
  "professionele verf kopen",
  "lakverf kopen",
  "behang kopen",
  "kwasten en verfrollers",
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Kies in demo een plausibele rankende pagina op basis van het zoekwoord. */
function mockUrlFor(keyword: string): string {
  const k = keyword.toLowerCase();
  let path = "/";
  if (k.includes("kleur") || k.includes("ral") || k.includes("mengen")) path = "/kleurenkiezer";
  else if (k.includes("behang")) path = "/categorie/behang";
  else if (k.includes("kwast") || k.includes("roller") || k.includes("gereedschap"))
    path = "/categorie/gereedschap";
  else if (k.includes("verf") || k.includes("lak") || k.includes("beits")) path = "/categorie/verf";
  return `https://www.${SITE_DOMAIN}${path}`;
}

/** Deterministische demo-uitslag (zonder SERPAPI_KEY). */
function mockRank(keyword: string): KeywordRank {
  const h = hash(keyword);
  // ~80% "gevonden"; rest niet in de top → realistisch beeld.
  if (h % 5 === 0) return { keyword, position: null, source: "mock" };
  return {
    keyword,
    position: (h % 28) + 1,
    url: mockUrlFor(keyword),
    title: `KLUSR — ${keyword}`,
    source: "mock",
  };
}

/**
 * Zoek de positie van klus-r.nl voor één zoekwoord. Faalt nooit hard: bij een
 * fout of zonder sleutel valt 'ie terug op de demo-uitslag.
 */
export async function checkKeywordRank(keyword: string): Promise<KeywordRank> {
  if (!SERPAPI_KEY) return mockRank(keyword);
  try {
    const params = new URLSearchParams({
      engine: "google",
      q: keyword,
      google_domain: "google.nl",
      gl: "nl",
      hl: "nl",
      num: "50",
      api_key: SERPAPI_KEY,
    });
    const res = await fetch(`https://serpapi.com/search.json?${params.toString()}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return { keyword, position: null, source: "serpapi" };
    const data = (await res.json()) as {
      organic_results?: { position?: number; link?: string; title?: string }[];
    };
    const organic = Array.isArray(data.organic_results) ? data.organic_results : [];
    for (const r of organic) {
      const link = String(r.link ?? "");
      if (link.includes(SITE_DOMAIN)) {
        return {
          keyword,
          position: typeof r.position === "number" ? r.position : null,
          url: link,
          title: r.title,
          source: "serpapi",
        };
      }
    }
    // Niet gevonden in de opgehaalde resultaten.
    return { keyword, position: null, source: "serpapi" };
  } catch {
    return { keyword, position: null, source: "serpapi" };
  }
}

/** Verwerk een lijst zoekwoorden met begrensde gelijktijdigheid (rate-vriendelijk). */
export async function checkKeywordRanks(
  keywords: string[],
  concurrency = 4,
): Promise<KeywordRank[]> {
  const out: KeywordRank[] = new Array(keywords.length);
  let i = 0;
  async function worker() {
    while (i < keywords.length) {
      const idx = i++;
      out[idx] = await checkKeywordRank(keywords[idx]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, keywords.length) }, () => worker()),
  );
  return out;
}
