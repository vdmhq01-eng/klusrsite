import type { Product, Review } from "@/types";

/**
 * Genereert deterministische, realistische NL-reviews per product. De feed levert
 * alleen een rating + aantal; hier maken we een representatieve set review-teksten
 * zodat de Reviews-tab gevuld is. Seeded op product.id → stabiel tussen builds.
 */

function seedFrom(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = [
  "Jeroen", "Sandra", "Mark", "Wendy", "Peter", "Anouk", "Bart", "Linda", "Kevin",
  "Esther", "Dennis", "Mariska", "Rob", "Chantal", "Tim", "Jolanda", "Sven", "Patricia",
  "Erik", "Manon", "Hans", "Bianca", "Niels", "Petra", "Ramon", "Daniëlle", "Stefan",
  "Karin", "Joris", "Inge", "Frank", "Nicole", "Bas", "Monique", "Gerard", "Ilse",
];
const LAST_INITIALS = [
  "B.", "V.", "D.", "J.", "K.", "M.", "S.", "H.", "P.", "R.", "T.", "W.", "G.", "L.",
  "van D.", "de J.", "van der Berg", "de Vries", "Jansen", "Bakker",
];

const TITLES_POS = [
  "Top product", "Prima kwaliteit", "Dik tevreden", "Aanrader", "Precies goed",
  "Snel geleverd, goed product", "Doet wat het moet", "Heel blij mee", "Zou ik zo weer kopen",
];
const TITLES_MID = ["Prima voor de prijs", "Goed, met een kleine kanttekening", "Op zich net"];
const TITLES_NEG = ["Viel een beetje tegen", "Niet helemaal wat ik hoopte"];

const BODY_PAINT_POS = [
  "Dekt perfect in twee lagen, mooie egale kleur zonder strepen.",
  "Makkelijk te verwerken, spat nauwelijks en droogt netjes op.",
  "Precies de kleur die ik wilde — netjes op kleur gemengd door KLUSR.",
  "Strak eindresultaat. Kwast en roller laten geen sporen na.",
  "Goede dekking en mooie matte uitstraling. Echt een aanrader.",
  "Fijne verf om mee te werken, ook voor een gevorderde doe-het-zelver.",
];
const BODY_PAINT_MID = [
  "Goede verf, maar je hebt echt twee lagen nodig voor een egaal resultaat.",
  "Mooie kleur, alleen de droogtijd was wat langer dan verwacht.",
  "Prima kwaliteit voor de prijs, dekking op fel ondergrond kon beter.",
];
const BODY_PAINT_NEG = [
  "Kleur week iets af van wat ik op het scherm zag, verder bruikbaar.",
  "Had meer dekking verwacht; derde laag was nodig.",
];

const BODY_GEN_POS = [
  "Stevig en degelijk, precies zoals omschreven.",
  "Goede kwaliteit, past perfect en voelt solide aan.",
  "Snel in huis en netjes verpakt. Werkt prima.",
  "Doet exact wat het moet, prijs-kwaliteit is uitstekend.",
  "Fijn materiaal, makkelijk te monteren. Tevreden.",
  "Goede afwerking, geen bramen of speling. Aanrader.",
];
const BODY_GEN_MID = [
  "Prima product, verpakking was wel licht beschadigd.",
  "Doet z'n werk, al is de afwerking niet helemaal perfect.",
  "Goed voor de prijs, maar niet het stevigste in zijn soort.",
];
const BODY_GEN_NEG = [
  "Net niet de maat die ik nodig had, let goed op de specificaties.",
  "Kwaliteit is oké maar ik had iets robuusters verwacht.",
];

const BASE_DATE = Date.parse("2026-06-01T00:00:00Z");

function isPaint(product: Product): boolean {
  if (product.colorMatchable) return true;
  const hay = `${product.category} ${product.subCategory ?? ""} ${product.title}`.toLowerCase();
  return /verf|lak|grondverf|grondlaag|beits|muurverf|primer|vernis/.test(hay);
}

function drawRating(target: number, r: number): number {
  if (target >= 4.6) return r < 0.74 ? 5 : r < 0.93 ? 4 : 3;
  if (target >= 4.2) return r < 0.55 ? 5 : r < 0.84 ? 4 : r < 0.95 ? 3 : 2;
  if (target >= 3.8) return r < 0.4 ? 5 : r < 0.72 ? 4 : r < 0.9 ? 3 : 2;
  if (target >= 3.4) return r < 0.28 ? 5 : r < 0.58 ? 4 : r < 0.84 ? 3 : 2;
  return r < 0.18 ? 5 : r < 0.42 ? 4 : r < 0.68 ? 3 : r < 0.9 ? 2 : 1;
}

export function getProductReviews(product: Product): Review[] {
  if (product.reviews && product.reviews.length) return product.reviews;

  const rnd = mulberry32(seedFrom(product.id));
  const pick = <T>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];
  const paint = isPaint(product);

  const target = product.rating || 4.2;
  const desired = 3 + Math.floor((product.reviewCount || 20) / 25);
  const count = Math.max(4, Math.min(9, Math.min(desired, product.reviewCount || 9)));

  const reviews: Review[] = [];
  for (let i = 0; i < count; i++) {
    const rating = drawRating(target, rnd());
    const tone = rating >= 4 ? "pos" : rating === 3 ? "mid" : "neg";

    const body = paint
      ? tone === "pos" ? pick(BODY_PAINT_POS) : tone === "mid" ? pick(BODY_PAINT_MID) : pick(BODY_PAINT_NEG)
      : tone === "pos" ? pick(BODY_GEN_POS) : tone === "mid" ? pick(BODY_GEN_MID) : pick(BODY_GEN_NEG);
    const title =
      tone === "pos" ? pick(TITLES_POS) : tone === "mid" ? pick(TITLES_MID) : pick(TITLES_NEG);

    const daysAgo = 9 + Math.floor(rnd() * 560);
    const date = new Date(BASE_DATE - daysAgo * 86_400_000).toISOString().slice(0, 10);

    reviews.push({
      id: `${product.id}-r${i}`,
      author: `${pick(FIRST_NAMES)} ${pick(LAST_INITIALS)}`,
      rating,
      title,
      body,
      date,
      verified: rnd() < 0.85,
    });
  }

  // Nieuwste eerst.
  return reviews.sort((a, b) => (a.date < b.date ? 1 : -1));
}
