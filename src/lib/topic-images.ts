/**
 * Trefwoorden per categorie/onderwerp → klus-relevante placeholderfoto's.
 * Gebruikt voor redactioneel beeld (hero, categorie-tegels, artikelen, winkels)
 * zolang er nog geen eigen fotobibliotheek/Channable-beeld is gekoppeld.
 */
const CATEGORY_KEYWORDS: Record<string, string> = {
  verf: "paint,wall,painting",
  "afbouw-fijnbouw": "plastering,renovation,wall",
  ijzerwaren: "screws,bolts,hardware",
  elektra: "electrician,wiring,socket",
  gereedschap: "tools,workshop,drill",
  tuin: "garden,fence,wood",
  verlichting: "lightbulb,lamp,lighting",
  "vloeren-raam": "laminate,flooring,floor",
  acties: "paint,hardware,store",
};

const ARTICLE_KEYWORDS: Record<string, string> = {
  Verven: "painting,wall,roller",
  Gereedschap: "paintbrush,tools,workshop",
  Inspiratie: "interior,home,decor",
  Tuin: "fence,garden,wood",
  Buiten: "house,facade,exterior",
  Elektra: "electrician,socket,wiring",
  Vloeren: "laminate,flooring,floor",
};

export const categoryKeywords = (slug: string): string =>
  CATEGORY_KEYWORDS[slug] ?? "diy,home,renovation";

export const articleKeywords = (category: string): string =>
  ARTICLE_KEYWORDS[category] ?? "diy,home,renovation";

/** Stabiele, keyword-relevante foto-URL (vast per seed via ?lock). */
export function topicImageUrl(keywords: string, seed = "klusr"): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return `https://loremflickr.com/640/480/${keywords}?lock=${h % 100000}`;
}

/**
 * Artikel-specifieke trefwoorden per slug → een UNIEKE, onderwerp-relevante
 * hero-foto per blog. Zonder dit zouden alle artikelen in dezelfde categorie
 * dezelfde trefwoorden (en dus visueel vergelijkbare foto's) krijgen. Valt
 * terug op de categorie-trefwoorden voor onbekende slugs.
 */
const ARTICLE_HERO_KEYWORDS: Record<string, string> = {
  "muur-verven-stappenplan": "wall,painting,roller",
  "juiste-kwast-of-roller-kiezen": "paintbrush,paint,roller",
  "kleur-kiezen-interieur": "color,swatches,interior",
  "schutting-beitsen": "fence,wood,stain",
  "stopcontact-veilig-vervangen": "socket,electrician,wiring",
  "laminaat-leggen-tips": "laminate,flooring,floor",
  "hoeveel-verf-nodig-berekenen": "paint,bucket,measuring",
  "latex-muurverf-sausverf-verschil": "paint,roller,interior",
  "primer-of-grondverf-wanneer-nodig": "primer,wood,brush",
  "badkamer-schilderen-schimmelwerend": "bathroom,tiles,paint",
  "buiten-schilderen-temperatuur-seizoen": "house,facade,exterior",
  "kozijnen-schilderen-stappenplan": "window,frame,paint",
  "behang-verwijderen-muur-voorbereiden": "wallpaper,wall,renovation",
  "schuurpapier-korrel-kiezen": "sandpaper,sanding,wood",
  "mengverf-elke-kleur-laten-mengen": "paint,mixing,color",
};

/** Unieke hero-trefwoorden voor één artikel; valt terug op de categorie. */
export function articleHeroKeywords(slug: string, category: string): string {
  return ARTICLE_HERO_KEYWORDS[slug] ?? articleKeywords(category);
}
