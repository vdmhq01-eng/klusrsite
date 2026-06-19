/**
 * Geeft de actieve catalogus-snapshot (feed-products.generated.json) een
 * organische, geloofwaardige rating/reviewCount-verdeling — inclusief lagere
 * scores én producten zonder reviews — en regenereert de bijbehorende reviews
 * zodat ze het gemiddelde volgen (kritische reviews bij een lage score, lege
 * staat bij 0). Raakt uitsluitend rating / reviewCount / reviews aan; prijzen,
 * voorraad, specs e.d. blijven ongemoeid.
 *
 * Waarom een aparte build-stap?
 *   De Channable-/Tilroy-feed levert zelf geen reviews; die worden synthetisch
 *   bijgemaakt. De oude logica gaf álles 4,1–4,9 met 8–247 reviews, wat nep
 *   oogt. De generator (scripts/lib/catalog-map.mjs) bevat nu dezelfde, betere
 *   verdeling, maar in de praktijk 403't de feed-sync en blijft de reeds
 *   gecommitte snapshot staan. Deze stap zorgt dat ook díe snapshot er echt
 *   uitziet — deterministisch (geseed op product-id) en idempotent, dus elke
 *   build levert exact hetzelfde resultaat.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "..", "src", "lib", "data", "feed-products.generated.json");

function seeded(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}
const round2 = (n) => Math.round(n * 100) / 100;

const SYNTH_POS = [
  { author: "Mark V.", body: "Goede kwaliteit en snel geleverd. Advies in de winkel was top.", rating: 5 },
  { author: "Sanne K.", body: "Precies wat ik nodig had voor mijn klus. Fijne service.", rating: 5 },
  { author: "Joost B.", body: "Prima product, doet wat het moet doen.", rating: 4 },
  { author: "Petra D.", body: "Tevreden! Goede prijs-kwaliteitverhouding.", rating: 4 },
  { author: "Henk J.", body: "Doet z'n werk en netjes afgewerkt. Zou ik weer kopen.", rating: 4 },
];
const SYNTH_MID = [
  { author: "Wendy K.", body: "Prima voor de prijs, maar niet bijzonder. Verpakking was wat gedeukt.", rating: 3 },
  { author: "Rob M.", body: "Op zich oké, alleen de afwerking kon beter.", rating: 3 },
  { author: "Bianca S.", body: "Doet het, maar ik had iets steviger verwacht voor dit geld.", rating: 3 },
];
const SYNTH_NEG = [
  { author: "Dennis B.", body: "Viel tegen — kwaliteit was minder dan ik hoopte.", rating: 2 },
  { author: "Karin L.", body: "Niet helemaal wat ik ervan verwachtte, let goed op de specs.", rating: 2 },
];

function synthReviews(seed, count, avg) {
  if (!avg || avg <= 0 || !count || count <= 0) return [];
  const n = Math.max(1, Math.min(4, count));
  const out = [];
  for (let i = 0; i < n; i++) {
    const r = seeded(`${seed}-rv${i}`);
    let pool;
    if (avg >= 4.5) pool = r < 0.85 ? SYNTH_POS : SYNTH_MID;
    else if (avg >= 4.0) pool = r < 0.68 ? SYNTH_POS : r < 0.92 ? SYNTH_MID : SYNTH_NEG;
    else if (avg >= 3.5) pool = r < 0.42 ? SYNTH_POS : r < 0.78 ? SYNTH_MID : SYNTH_NEG;
    else pool = r < 0.25 ? SYNTH_POS : r < 0.62 ? SYNTH_MID : SYNTH_NEG;
    const s = pool[Math.floor(seeded(`${seed}-rp${i}`) * pool.length)];
    out.push({
      id: `${seed}-r${i}`,
      author: s.author,
      rating: i === 0 ? Math.max(1, Math.min(5, Math.round(avg))) : s.rating,
      body: s.body,
      date: new Date(2026, 4 - (i % 5), 20 - i * 4).toISOString(),
      verified: seeded(`${seed}-rvf${i}`) < 0.85,
    });
  }
  return out;
}

/**
 * Organisch rating/reviewCount-profiel, deterministisch geseed op product-id.
 * Bewust ~60% ZONDER reviews (nieuw/niche), ~40% mét — en de AANTALLEN bewust
 * laag gehouden (een kleine winkel): de meeste producten 2-3 reviews, sterk
 * aflopend, met een maximum van 40 (dus nooit boven de 100).
 *   ~60% geen reviews → 0 reviews (rating 0)
 *   ~6%  toppers      → 4.6–4.9
 *   ~12% lager scoren → 3.1–3.9
 *   ~22% mid          → 4.0–4.6
 * Het aantal reviews staat los van de tier en is voor iedereen 2..40 (skew laag).
 */
export function ratingProfile(id) {
  const tier = seeded(`${id}-tier`);
  const a = seeded(`${id}-ra`);
  const b = seeded(`${id}-rb`);
  // ~60% van de producten heeft (nog) GEEN reviews; de overige ~40% wél.
  if (tier < 0.6) return { rating: 0, reviewCount: 0 };
  // Aantal reviews: de meeste producten 2-3, sterk aflopend, max 40 (b^3-skew).
  const reviewCount = Math.min(40, 2 + Math.floor(b * b * b * 39));
  // Binnen de ~40% mét reviews varieert alleen de SCORE per tier.
  if (tier < 0.66) return { rating: round2(4.6 + a * 0.3), reviewCount }; // toppers
  if (tier < 0.78) return { rating: round2(3.1 + a * 0.8), reviewCount }; // lager
  return { rating: round2(4.0 + a * 0.6), reviewCount };                   // mid
}

export function reseedReviews(data) {
  const P = data.products || [];
  const stats = { total: P.length, zero: 0, low: 0, mid: 0, high: 0 };
  for (const p of P) {
    const { rating, reviewCount } = ratingProfile(p.id);
    p.rating = rating;
    p.reviewCount = reviewCount;
    p.reviews = synthReviews(p.id, Math.min(4, reviewCount), rating);
    // BESTSELLER alleen voor echte toppers; strip 'm waar de score 'm niet
    // (meer) rechtvaardigt. Voeg niet automatisch toe.
    if (Array.isArray(p.badges) && p.badges.includes("BESTSELLER")) {
      if (!(rating >= 4.6 && reviewCount >= 170)) {
        p.badges = p.badges.filter((b) => b !== "BESTSELLER");
        if (p.badges.length === 0) delete p.badges;
      }
    }
    if (reviewCount === 0) stats.zero++;
    else if (rating < 4.0) stats.low++;
    else if (rating < 4.6) stats.mid++;
    else stats.high++;
  }
  return stats;
}

// CLI: alleen draaien als de snapshot bestaat; nooit de build breken.
function main() {
  if (!existsSync(FILE)) {
    console.warn("⚠ Geen catalogus-snapshot gevonden — review-verdeling overgeslagen.");
    return;
  }
  let data;
  try {
    data = JSON.parse(readFileSync(FILE, "utf8"));
  } catch (err) {
    console.warn("⚠ Snapshot onleesbaar — review-verdeling overgeslagen:", err.message);
    return;
  }
  const stats = reseedReviews(data);
  writeFileSync(FILE, JSON.stringify(data, null, 2) + "\n");
  console.log(
    `→ Review-verdeling toegepast: ${stats.total} producten ` +
      `(${stats.zero} zonder reviews, ${stats.low} lager beoordeeld <4.0, ` +
      `${stats.mid} 4.0–4.5, ${stats.high} 4.6+).`,
  );
}

main();
