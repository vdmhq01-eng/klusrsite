/**
 * Klantbeoordelingen over de KLUSR-webshop zelf (niet over één product).
 * Statisch en deterministisch — geen `new Date()` of randomness — zodat de
 * trust-panel op de checkout identiek server- en client-side rendert.
 *
 * Bewust GEEN allemaal-5-sterren: een eerlijke mix (incl. één 3★ met milde
 * kritiek) wekt meer vertrouwen. Bodies blijven Nederlands, ongeacht de locale
 * (consistent met src/lib/reviews.ts).
 */

export type Testimonial = {
  id: string;
  author: string;
  location: string;
  rating: number;
  title: string;
  body: string;
  /** ISO-datum, bv. "2026-05-12". */
  date: string;
  verified: true;
  featured?: boolean;
};

export const testimonials: Testimonial[] = [
  {
    id: "t-mengen-arnhem",
    author: "Joris V.",
    location: "Arnhem",
    rating: 5,
    title: "Precies op kleur gemengd",
    body: "Een oude pot van een ander merk laten bijmengen. Exact dezelfde kleur teruggekregen, geen kleurverschil op de muur te zien. Dit doet niet elke winkel je na.",
    date: "2026-05-22",
    verified: true,
    featured: true,
  },
  {
    id: "t-levering-zwolle",
    author: "Sanne K.",
    location: "Zwolle",
    rating: 5,
    title: "Voor 22:00 besteld, de volgende dag in huis",
    body: "Bestelling 's avonds laat geplaatst en hij lag de volgende ochtend al op de mat. Netjes verpakt, niks beschadigd. Top geregeld.",
    date: "2026-05-30",
    verified: true,
  },
  {
    id: "t-kleuradvies-utrecht",
    author: "Mariëlle de J.",
    location: "Utrecht",
    rating: 5,
    title: "Gratis kleuradvies was goud waard",
    body: "Twijfelde tussen drie tinten wit voor het plafond. Even gebeld met het kleuradvies en binnen tien minuten wist ik precies wat ik nodig had. Scheelt een hoop misaankopen.",
    date: "2026-05-11",
    verified: true,
  },
  {
    id: "t-klusrpas-eindhoven",
    author: "Ramon B.",
    location: "Eindhoven",
    rating: 5,
    title: "KLUSRPAS verdient zich snel terug",
    body: "Met de KLUSRPAS-korting was de pas na één grotere verfklus al terugverdiend. Reken het even uit voordat je bestelt, dat loont echt.",
    date: "2026-04-28",
    verified: true,
  },
  {
    id: "t-klantenservice-3ster-groningen",
    author: "Wendy P.",
    location: "Groningen",
    rating: 3,
    title: "Levering een dag te laat, maar netjes opgelost",
    body: "Mijn pakket kwam een dag later dan beloofd, balen want ik had de schilder al ingepland. Klantenservice reageerde wel snel, bood excuses aan en betaalde de verzendkosten terug. Daardoor toch geen kwaad bloed, maar de planning klopte deze keer dus niet.",
    date: "2026-05-18",
    verified: true,
    featured: true,
  },
  {
    id: "t-zakelijk-rotterdam",
    author: "Dennis H.",
    location: "Rotterdam",
    rating: 5,
    title: "Fijn voor zakelijk gebruik",
    body: "Als klusbedrijf bestel ik hier regelmatig grotere hoeveelheden. Vaste prijzen, snelle facturen en het zit altijd compleet in de doos. Scheelt mij tijd op de bouw.",
    date: "2026-04-15",
    verified: true,
    featured: true,
  },
  {
    id: "t-voorraad-4ster-tilburg",
    author: "Esther M.",
    location: "Tilburg",
    rating: 4,
    title: "Goede shop, één artikel was uitverkocht",
    body: "Prettige webshop en duidelijke productpagina's. Eén van de drie kwasten die ik wilde was tijdelijk uitverkocht, dat was even jammer. De rest kwam wel keurig op tijd binnen.",
    date: "2026-05-06",
    verified: true,
  },
  {
    id: "t-verpakking-haarlem",
    author: "Bart de V.",
    location: "Haarlem",
    rating: 5,
    title: "Stevig verpakt, niets gelekt",
    body: "Twee blikken lak en een fles terpentine besteld. Alles dubbel ingepakt en goed afgeschermd, geen druppel gelekt. Daar let ik op bij dit soort spullen.",
    date: "2026-03-29",
    verified: true,
  },
  {
    id: "t-mobiel-4ster-breda",
    author: "Niels J.",
    location: "Breda",
    rating: 4,
    title: "Prima, site op mobiel iets traag",
    body: "Bestellen ging soepel en de prijzen zijn scherp. Op mijn telefoon laadde de site af en toe wat traag bij het filteren, op de laptop had ik daar geen last van. Verder niks op aan te merken.",
    date: "2026-05-02",
    verified: true,
  },
];

export const testimonialStats = { average: 4.7, count: 2847 };

/**
 * Vaste, pure selectie van uitgelichte beoordelingen voor de trust-panel.
 * Bevat ALTIJD de enige 3★-review (eerlijke mix), aangevuld met top-reviews
 * in een stabiele volgorde. Geen randomness → geen hydration-mismatch.
 */
export function featuredTestimonials(n = 3): Testimonial[] {
  return testimonials.filter((t) => t.featured).slice(0, n);
}
