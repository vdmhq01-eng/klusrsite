import type { Category } from "@/types";

/**
 * Verf-taxonomie in 7 groepen → SEO-landingspagina's per type. Elke leaf is een
 * eigen pagina (/categorie/verf/<slug>) met eigen tekst en gekoppelde producten.
 * De groepen structureren het mega-menu; de flat-lijst voedt routing/filters.
 */
const verfSubGroups = [
  {
    title: "Lakken",
    slug: "lakken",
    subCategories: [
      { title: "Binnenlak", slug: "binnenlak" },
      { title: "Buitenlak", slug: "buitenlak" },
      { title: "Deur- en kozijnlak", slug: "deur-kozijnlak" },
      { title: "Meubellak", slug: "meubellak" },
      { title: "Traplak", slug: "traplak" },
    ],
  },
  {
    title: "Muurverf",
    slug: "muurverf",
    subCategories: [
      { title: "Binnenmuurverf", slug: "binnenmuurverf" },
      { title: "Buitenmuurverf", slug: "buitenmuurverf" },
      { title: "Plafondverf", slug: "plafondverf" },
      { title: "Schrobvaste verf", slug: "schrobvaste-verf" },
    ],
  },
  {
    title: "Beits",
    slug: "beits",
    subCategories: [
      { title: "Transparante beits", slug: "transparante-beits" },
      { title: "Dekkende beits", slug: "dekkende-beits" },
    ],
  },
  {
    title: "Grondverf & primers",
    slug: "grondverf-primers",
    subCategories: [
      { title: "Grondverf voor hout", slug: "grondverf-hout" },
      { title: "Grondverf voor metaal", slug: "grondverf-metaal" },
      { title: "Multiprimers", slug: "multiprimer" },
      { title: "Hechtprimers", slug: "hechtprimer" },
      { title: "Isolerende primers", slug: "isolerende-primer" },
    ],
  },
  {
    title: "Voorstrijk & grondering",
    slug: "voorstrijk-grondering",
    subCategories: [
      { title: "Voorstrijk", slug: "voorstrijk" },
      { title: "Diepgrond", slug: "diepgrond" },
      { title: "Fixeergrond", slug: "fixeergrond" },
    ],
  },
  {
    title: "Beton- & vloerverf",
    slug: "beton-vloerverf",
    subCategories: [
      { title: "Betonverf", slug: "betonverf" },
      { title: "Vloerverf", slug: "vloerverf" },
      { title: "Garageverf", slug: "garageverf" },
      { title: "Trapverf", slug: "trapverf" },
      { title: "2-componenten vloercoating", slug: "vloercoating-2k" },
    ],
  },
  {
    title: "Speciale verf",
    slug: "speciale-verf",
    subCategories: [
      { title: "Radiatorverf", slug: "radiatorverf" },
      { title: "Schoolbordverf", slug: "schoolbordverf" },
      { title: "Magneetverf", slug: "magneetverf" },
      { title: "Hittebestendige verf", slug: "hittebestendige-verf" },
      { title: "Tegelverf", slug: "tegelverf" },
      { title: "Spuitverf", slug: "spuitverf" },
    ],
  },
];

/**
 * Top-level navigation categories. "Verf" is dominant per KLUSR positioning.
 */
export const categories: Category[] = [
  {
    id: "verf",
    title: "Verf",
    slug: "verf",
    image: "https://picsum.photos/seed/klusr-cat-verf/800/600",
    icon: "PaintBucket",
    description:
      "Professionele verf voor binnen en buiten. Gemengd op elke kleur, met advies van ex-schilders.",
    seoTitle: "Verf kopen | Binnen- & buitenverf op kleur gemengd | KLUSR",
    seoDescription:
      "Koop professionele verf bij KLUSR. Binnenverf, buitenverf, lak, beits en primer. Op kleur gemengd, voor 16:00 besteld morgen in huis.",
    paint: true,
    subGroups: verfSubGroups,
    subCategories: verfSubGroups.flatMap((g) => g.subCategories),
  },
  {
    id: "afbouw-fijnbouw",
    title: "Afbouw & fijnbouw",
    slug: "afbouw-fijnbouw",
    image: "https://picsum.photos/seed/klusr-cat-afbouw/800/600",
    icon: "Layers",
    description:
      "Plamuur, stucwerk, kit, vulmiddel en alles voor een strakke afwerking.",
    seoTitle: "Afbouw & fijnbouw | Plamuur, kit & vulmiddel | KLUSR",
    seoDescription:
      "Afbouwmaterialen voor een perfecte afwerking: plamuur, stuc, kit, vulmiddel en gereedschap. Bestel eenvoudig online bij KLUSR.",
    subCategories: [
      { title: "Plamuur & vulmiddel", slug: "plamuur" },
      { title: "Kit & purschuim", slug: "kit" },
      { title: "Stuc & gips", slug: "stuc" },
      { title: "Schuurmateriaal", slug: "schuren" },
    ],
  },
  {
    id: "ijzerwaren",
    title: "IJzerwaren",
    slug: "ijzerwaren",
    image: "https://picsum.photos/seed/klusr-cat-ijzerwaren/800/600",
    icon: "Wrench",
    description: "Schroeven, pluggen, beslag, sloten en bevestigingsmateriaal.",
    seoTitle: "IJzerwaren & bevestiging | Schroeven, pluggen & beslag | KLUSR",
    seoDescription:
      "IJzerwaren bij KLUSR: schroeven, pluggen, beslag, sloten en scharnieren. Professionele kwaliteit, scherp geprijsd.",
    subCategories: [
      { title: "Schroeven & bouten", slug: "schroeven" },
      { title: "Pluggen", slug: "pluggen" },
      { title: "Beslag & scharnieren", slug: "beslag" },
      { title: "Sloten", slug: "sloten" },
    ],
  },
  {
    id: "elektra",
    title: "Elektra",
    slug: "elektra",
    image: "https://picsum.photos/seed/klusr-cat-elektra/800/600",
    icon: "Plug",
    description:
      "Schakelmateriaal, kabels, stopcontacten en alles voor je elektraklus.",
    seoTitle: "Elektra & schakelmateriaal | Stopcontacten & kabel | KLUSR",
    seoDescription:
      "Elektra bij KLUSR: stopcontacten, schakelaars, kabel en installatiemateriaal. Met duidelijke uitleg en advies.",
    subCategories: [
      { title: "Schakelaars & stopcontacten", slug: "schakelmateriaal" },
      { title: "Kabel & draad", slug: "kabel" },
      { title: "Verdeel & groepenkast", slug: "verdeelkast" },
    ],
  },
  {
    id: "gereedschap",
    title: "Gereedschap",
    slug: "gereedschap",
    image: "https://picsum.photos/seed/klusr-cat-gereedschap/800/600",
    icon: "Hammer",
    description:
      "Hand- en elektrisch gereedschap van topmerken voor elke klus.",
    seoTitle: "Gereedschap kopen | Hand- & elektrisch gereedschap | KLUSR",
    seoDescription:
      "Gereedschap bij KLUSR: boormachines, accuschroevendraaiers, handgereedschap en schildersgereedschap van topmerken.",
    subCategories: [
      { title: "Schildersgereedschap", slug: "schildersgereedschap" },
      { title: "Elektrisch gereedschap", slug: "elektrisch-gereedschap" },
      { title: "Handgereedschap", slug: "handgereedschap" },
      { title: "Meetgereedschap", slug: "meetgereedschap" },
    ],
  },
  {
    id: "tuin",
    title: "Tuin",
    slug: "tuin",
    image: "https://picsum.photos/seed/klusr-cat-tuin/800/600",
    icon: "Sprout",
    description: "Tuinverf, beits, gereedschap en alles voor buiten.",
    seoTitle: "Tuin & buiten | Tuinverf, beits & gereedschap | KLUSR",
    seoDescription:
      "Alles voor je tuin bij KLUSR: tuinhoutbeits, buitenverf, tuingereedschap en bevestiging voor buiten.",
    subCategories: [
      { title: "Tuinhoutbeits", slug: "tuinhoutbeits" },
      { title: "Tuingereedschap", slug: "tuingereedschap" },
      { title: "Bestrating & onderhoud", slug: "bestrating" },
    ],
  },
  {
    id: "verlichting",
    title: "Verlichting",
    slug: "verlichting",
    image: "https://picsum.photos/seed/klusr-cat-verlichting/800/600",
    icon: "Lightbulb",
    description: "LED-lampen, armaturen en buitenverlichting.",
    seoTitle: "Verlichting kopen | LED-lampen & armaturen | KLUSR",
    seoDescription:
      "Verlichting bij KLUSR: LED-lampen, armaturen, spots en buitenverlichting. Energiezuinig en sfeervol.",
    subCategories: [
      { title: "LED-lampen", slug: "led-lampen" },
      { title: "Armaturen", slug: "armaturen" },
      { title: "Buitenverlichting", slug: "buitenverlichting" },
    ],
  },
  {
    id: "vloeren-raam",
    title: "Vloeren & raam",
    slug: "vloeren-raam",
    image: "https://picsum.photos/seed/klusr-cat-vloeren/800/600",
    icon: "LayoutPanelTop",
    description: "Laminaat, PVC, ondervloer en raamdecoratie.",
    seoTitle: "Vloeren & raamdecoratie | Laminaat, PVC & gordijnen | KLUSR",
    seoDescription:
      "Vloeren en raamdecoratie bij KLUSR: laminaat, PVC-vloeren, ondervloer, plinten en raamdecoratie.",
    subCategories: [
      { title: "Laminaat & PVC", slug: "laminaat-pvc" },
      { title: "Ondervloer & plinten", slug: "ondervloer" },
      { title: "Raamdecoratie", slug: "raamdecoratie" },
    ],
  },
  {
    id: "acties",
    title: "Acties",
    slug: "acties",
    image: "https://picsum.photos/seed/klusr-cat-acties/800/600",
    icon: "Tag",
    description: "De scherpste aanbiedingen en KLUSRPAS-voordeel.",
    seoTitle: "Acties & aanbiedingen | Klusvoordeel | KLUSR",
    seoDescription:
      "Profiteer van de scherpste acties bij KLUSR. Tijdelijke aanbiedingen op verf, gereedschap en meer.",
  },
];

export const navCategories = categories;

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCategoryTitle(slug: string): string {
  return categories.find((c) => c.slug === slug)?.title ?? slug;
}
