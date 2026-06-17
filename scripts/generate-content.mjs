// @ts-nocheck
/**
 * Bulk-generatie van SEO- en FAQ-content (en optioneel beschrijving/specs) voor
 * de hele productcatalogus met Claude — als achtergrond-job, zónder dat de admin
 * een browsertabblad hoeft open te houden.
 *
 * Dit is de server-side tegenhanger van de client-loop in
 * src/components/admin/ai-content-manager.tsx (knop "Bulk: SEO + FAQ"). Het
 * gebruikt EXACT dezelfde prompts, model en systeemprompt als de route
 * src/app/api/ai/generate-content/route.ts, zodat de kwaliteit identiek is. De
 * gegenereerde tekst wordt — net als de admin-knop "publiceert direct" — meteen
 * in de live KV-store gezet onder `product-content:<id>` (zie
 * src/lib/store/product-content.ts), met dezelfde merge-shape per type.
 *
 *   ANTHROPIC_API_KEY=sk-ant-... \
 *   KV_REST_API_URL=... KV_REST_API_TOKEN=... \
 *   node scripts/generate-content.mjs
 *
 * Opties (env of CLI als KEY=value):
 *   TYPES=seo,faqs        welke content-types (default seo,faqs)
 *   LIMIT=0               max. aantal producten deze run (0/leeg = alle)
 *   ONLY_MISSING=true     sla een (product,type) over als KV die al heeft (default true)
 *   CONCURRENCY=3         aantal producten parallel (default 3, houd klein)
 *   DRY_RUN=false         alleen tonen wat er zou gebeuren, niets schrijven/aanroepen
 *   ANTHROPIC_MODEL=...   model (default claude-sonnet-4-6, gelijk aan client.ts)
 *
 * Resumable: een herhaalde run slaat al-gedane items over (ONLY_MISSING leest de
 * bestaande KV-inhoud via MGET). Best-effort: één mislukt product logt en gaat
 * door, de hele run breekt nooit af. Exponentiële backoff op 429/5xx.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, "..", "src", "lib", "data");

// ── Config (env of CLI-args als KEY=value) ────────────────────────────────────
for (const arg of process.argv.slice(2)) {
  const m = arg.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2];
}

const API_KEY = process.env.ANTHROPIC_API_KEY;
const BASE_URL = (process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com").replace(/\/$/, "");
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const VALID_TYPES = ["description", "specifications", "faqs", "seo"];
const TYPES = (process.env.TYPES || "seo,faqs")
  .split(",")
  .map((s) => s.trim())
  .filter((t) => VALID_TYPES.includes(t));
const LIMIT = parseInt(process.env.LIMIT || "0", 10) || 0;
const ONLY_MISSING = (process.env.ONLY_MISSING || "true").toLowerCase() !== "false";
const CONCURRENCY = Math.max(1, parseInt(process.env.CONCURRENCY || "3", 10));
const DRY_RUN = (process.env.DRY_RUN || "false").toLowerCase() === "true";
const MGET_BATCH = Math.max(1, parseInt(process.env.MGET_BATCH || "100", 10));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const readJson = (p, fb) => {
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return fb;
  }
};

// ── Prompt-bouw — 1-op-1 overgenomen uit src/app/api/ai/generate-content/route.ts
//    (alleen het `prompt`-gedeelte; de mock is hier niet nodig want AI is live).
const SYSTEM_PROMPT = `Je bent een ervaren Nederlandstalige webshop-copywriter voor KLUSR, een verfspeciaalzaak en lichte bouwmarkt met advies van ex-schilders. Schrijf in helder, wervend maar eerlijk Nederlands (je-vorm). Wees concreet en praktisch, gericht op doe-het-zelvers en klussers. Verzin GEEN prijzen, voorraad, kortingen of betaalinformatie — die velden worden nooit door AI ingevuld. Verzin geen exacte technische claims die je niet kunt onderbouwen; blijf bij plausibele, gangbare eigenschappen voor dit type product.`;

/** Bouw de user-prompt voor één (product, type) — identiek aan de route. */
function buildPrompt(type, { productLabel, title, brand, context }) {
  const label = productLabel || title;
  switch (type) {
    case "description":
      return `${context}\n\nSchrijf een wervende productbeschrijving voor de webshop van 2 korte alinea's (samen 60-110 woorden) voor "${label}". Benoem waarvoor het product geschikt is, de belangrijkste voordelen en een praktische verwerkingstip. Geen koppen, geen opsommingstekens, geen prijzen.`;
    case "specifications":
      return `${context}\n\nGenereer een overzichtelijke lijst met plausibele technische specificaties voor "${label}". Geef 6-9 regels in het formaat "Label: Waarde" (elk op een nieuwe regel). Denk aan eigenschappen als toepassing, ondergrond, glansgraad of materiaal, rendement/verbruik, droogtijd, verdunnen, gereedschap en inhoud-eenheid. Geen prijzen of voorraad.`;
    case "faqs":
      return `${context}\n\nSchrijf 3 tot 4 veelgestelde vragen met antwoord voor "${label}". Formatteer elke vraag op een regel beginnend met "V:" en het antwoord op de volgende regel beginnend met "A:". Houd antwoorden kort (1-3 zinnen), praktisch en eerlijk. Geen prijzen, voorraad of betaalinformatie.`;
    case "seo":
    default:
      return `${context}\n\nGenereer SEO-content voor de productpagina van "${label}". Lever exact dit formaat:\nMeta titel: <max 60 tekens, met merk indien beschikbaar>\nMeta beschrijving: <140-155 tekens, wervend, met een reden om bij KLUSR te kopen>\nSEO-tekst: <1 alinea van 40-70 woorden met relevante zoekwoorden, natuurlijk geschreven>\nGeen prijzen of voorraadinformatie.`;
  }
}

/** Productcontext exact zoals de route die opbouwt (titel/merk/categorie/pluspunten). */
function buildContext(product) {
  const title = (product.title ?? "dit product").trim();
  const brand = (product.brand ?? "").trim();
  const category = (product.category ?? "").trim();
  const productLabel = [brand, title].filter(Boolean).join(" ");
  const context = [
    `Productnaam: ${title}`,
    brand ? `Merk: ${brand}` : null,
    category ? `Categorie: ${category}` : null,
    product.highlights?.length
      ? `Bestaande pluspunten: ${product.highlights.join("; ")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
  return { productLabel, title, brand, context };
}

// ── Anthropic (zelfde model/params als client.ts: complete() ) ────────────────
/**
 * Eén completion met exponentiële backoff op 429/5xx. Gooit pas na de laatste
 * poging; de aanroeper vangt dat per product af (best-effort).
 */
async function complete(prompt, { maxTokens = 900, temperature = 0.7, retries = 5 } = {}) {
  let attempt = 0;
  for (;;) {
    let res;
    try {
      res = await fetch(`${BASE_URL}/v1/messages`, {
        method: "POST",
        headers: {
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: maxTokens,
          temperature,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: prompt }],
        }),
      });
    } catch (err) {
      // Netwerkfout → ook even terugvallen op backoff.
      if (attempt >= retries) throw err;
      await sleep(backoffMs(attempt++));
      continue;
    }

    if (res.ok) {
      const data = await res.json();
      const text = (data.content || [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      if (!text) throw new Error("leeg AI-antwoord");
      return text;
    }

    // 429 of 5xx → opnieuw met backoff; andere fouten → meteen falen.
    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      const retryAfter = parseInt(res.headers.get("retry-after") || "0", 10);
      const wait = retryAfter > 0 ? retryAfter * 1000 : backoffMs(attempt);
      attempt++;
      await sleep(wait);
      continue;
    }
    const body = await res.text().catch(() => "");
    throw new Error(`Anthropic ${res.status}: ${body.slice(0, 200)}`);
  }
}

function backoffMs(attempt) {
  // 1s, 2s, 4s, 8s, 16s (+ jitter), gecapt op 30s.
  const base = Math.min(30000, 1000 * 2 ** attempt);
  return base + Math.floor(Math.random() * 500);
}

// ── KV REST (Upstash/Vercel) — dependency-vrij, zoals src/lib/store/kv.ts ─────
async function kvCmd(args) {
  const res = await fetch(KV_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`KV ${args[0]} faalde: ${res.status}`);
  }
  const data = await res.json();
  if (data.error) throw new Error(`KV error: ${data.error}`);
  return data.result ?? null;
}

/** Lees meerdere product-content keys in één keer (MGET). */
async function kvMGet(keys) {
  if (keys.length === 0) return [];
  const res = await kvCmd(["MGET", ...keys]);
  return Array.isArray(res) ? res : keys.map(() => null);
}

/** Schrijf de volledige (gemergde) content-map voor één product terug. */
async function kvSetJSON(key, value) {
  await kvCmd(["SET", key, JSON.stringify(value)]);
}

const contentKey = (id) => `product-content:${id}`;

// ── Hoofdroutine ──────────────────────────────────────────────────────────────
async function main() {
  if (!TYPES.length) {
    console.error(`✗ Geen geldige TYPES. Kies uit: ${VALID_TYPES.join(", ")}.`);
    process.exit(1);
  }

  const feed = readJson(join(DATA, "feed-products.generated.json"), { products: [] });
  let products = feed.products || [];
  if (LIMIT > 0) products = products.slice(0, LIMIT);

  console.log(
    `→ generate-content: ${products.length} producten · types=[${TYPES.join(", ")}] · ` +
      `only_missing=${ONLY_MISSING} · concurrency=${CONCURRENCY}` +
      (DRY_RUN ? " · DRY_RUN" : ""),
  );

  // ── DRY_RUN: vóór elke key/API/KV-check een plan tonen en stoppen. ──────────
  // Dit is het enige pad dat in een sandbox zonder netwerk/keys draait.
  if (DRY_RUN) {
    const preview = products.slice(0, Math.min(products.length, LIMIT > 0 ? LIMIT : 20));
    console.log(`  (dry-run — geen API- of KV-calls; toon eerste ${preview.length} producten)`);
    let wouldGenerate = 0;
    for (let i = 0; i < preview.length; i++) {
      const p = preview[i];
      // In dry-run gaan we ervan uit dat niets in KV staat (we lezen niet),
      // dus alle gevraagde types zouden gegenereerd worden.
      const types = TYPES;
      wouldGenerate += types.length;
      console.log(
        `  [${i + 1}/${products.length}] ${p.title} — zou genereren: ${types.join(", ")}`,
      );
    }
    console.log(
      `✓ DRY_RUN klaar — zou ${wouldGenerate} item(s) genereren voor de eerste ` +
        `${preview.length} producten (van ${products.length}). Niets geschreven.`,
    );
    process.exit(0);
  }

  // ── Vanaf hier hebben we keys nodig. ───────────────────────────────────────
  if (!API_KEY) {
    console.error(
      "✗ ANTHROPIC_API_KEY ontbreekt — zonder key kan er geen content gegenereerd worden. " +
        "Zet de key (of voeg 'm toe als GitHub Actions-secret) en draai opnieuw.",
    );
    process.exit(1);
  }
  if (!KV_URL || !KV_TOKEN) {
    console.error(
      "✗ KV-credentials ontbreken (KV_REST_API_URL + KV_REST_API_TOKEN, of de " +
        "UPSTASH_REDIS_REST_URL/_TOKEN-varianten). Zonder KV kan de content niet " +
        "gepubliceerd worden. Zet de env-vars en draai opnieuw.",
    );
    process.exit(1);
  }

  // ── Bestaande content ophalen (MGET in batches) om al-gedane items over te slaan.
  const existing = new Map(); // id → content-map (of {} )
  for (let i = 0; i < products.length; i += MGET_BATCH) {
    const slice = products.slice(i, i + MGET_BATCH);
    let raws;
    try {
      raws = await kvMGet(slice.map((p) => contentKey(p.id)));
    } catch (err) {
      console.error(`✗ KV MGET faalde (batch vanaf ${i}): ${err.message}`);
      process.exit(1);
    }
    slice.forEach((p, j) => {
      const raw = raws[j];
      let parsed = {};
      if (raw != null) {
        try {
          parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        } catch {
          parsed = {};
        }
      }
      existing.set(p.id, parsed || {});
    });
  }

  let generated = 0;
  let skipped = 0;
  let failed = 0;
  let processed = 0;

  /** Verwerk één product: genereer de ontbrekende types en schrijf terug. */
  async function handle(product, index) {
    const current = existing.get(product.id) || {};
    const todo = TYPES.filter((t) => !(ONLY_MISSING && current[t]));
    const already = TYPES.filter((t) => ONLY_MISSING && current[t]);
    skipped += already.length;

    if (todo.length === 0) {
      processed++;
      console.log(
        `[${processed}/${products.length}] ${product.title} — ` +
          TYPES.map((t) => `${t} ↷`).join(" ") +
          " (al aanwezig)",
      );
      return;
    }

    const ctx = buildContext(product);
    const marks = [];
    let mutated = false;

    for (const t of already) marks.push(`${t} ↷`);
    for (const type of todo) {
      try {
        const text = await complete(buildPrompt(type, ctx), {
          maxTokens: 900,
          temperature: 0.7,
        });
        // Merge in dezelfde shape als saveProductContent (preserve andere types).
        current[type] = {
          productId: product.id,
          type,
          content: text,
          updatedAt: new Date().toISOString(),
        };
        mutated = true;
        generated++;
        marks.push(`${type} ✓`);
      } catch (err) {
        failed++;
        marks.push(`${type} ✗`);
        console.error(`    ! ${product.title} — ${type}: ${err.message}`);
      }
    }

    // Schrijf de gemergde map één keer terug (best-effort, gooit niet door).
    if (mutated) {
      try {
        await kvSetJSON(contentKey(product.id), current);
        existing.set(product.id, current);
      } catch (err) {
        console.error(`    ! ${product.title} — KV SET faalde: ${err.message}`);
      }
    }

    processed++;
    console.log(`[${processed}/${products.length}] ${product.title} — ${marks.join(" ")}`);
  }

  // ── Kleine worker-pool voor begrensde parallelliteit. ──────────────────────
  let cursor = 0;
  async function worker() {
    for (;;) {
      const i = cursor++;
      if (i >= products.length) return;
      await handle(products[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, products.length) }, worker));

  console.log(
    `\n✓ Klaar — gegenereerd: ${generated}, overgeslagen: ${skipped}, mislukt: ${failed} ` +
      `(over ${products.length} producten, types: ${TYPES.join(", ")}).`,
  );
  if (failed > 0) {
    console.log("  Tip: draai opnieuw — ONLY_MISSING slaat geslaagde items over en herstelt alleen de mislukte.");
  }
}

main().catch((err) => {
  console.error("✗ generate-content:", err);
  process.exit(1);
});
