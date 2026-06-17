import type { Locale } from "./config";

/**
 * Getypeerde berichtencatalogus voor de GLOBALE CHROME (topbar, footer, header).
 *
 * STADIUM 1: bewust alléén de globale chrome. Alle pagina-inhoud, product-/
 * categoriedata en losse contentpagina's blijven (voorlopig) hardcoded NL en
 * komen in een later stadium aan bod.
 *
 * Nederlands is de bron van waarheid. De NL-waarden hieronder zijn byte-identiek
 * aan de huidige hardcoded teksten in de componenten, zodat de site met de
 * feature-flag UIT exact hetzelfde rendert als nu.
 */
export type Messages = {
  // Top-USP-balk
  "usp.advice": string;
  "usp.quality": string;
  "usp.everything": string;
  "usp.delivery": string;

  // Header / site-brede labels
  "nav.customerService": string;
  "nav.cart": string;
  "nav.cartAria": string; // {count}
  "search.placeholder": string;

  // Footer — nieuwsbrief
  "footer.newsletter.title": string;
  "footer.newsletter.text": string;

  // Footer — merk-tagline
  "footer.tagline": string;

  // Footer — kolomtitels
  "footer.col.assortment": string;
  "footer.col.customerService": string;
  "footer.col.about": string;

  // Footer — klantenservice-links
  "footer.service.customerService": string;
  "footer.service.faq": string;
  "footer.service.orderStatus": string;
  "footer.service.shippingReturns": string;
  "footer.service.returnPolicy": string;
  "footer.service.securePayment": string;
  "footer.service.warranty": string;

  // Footer — over-KLUSR-links
  "footer.about.aboutKlusr": string;
  "footer.about.kluspas": string;
  "footer.about.business": string;
  "footer.about.mixPaint": string;
  "footer.about.colors": string;
  "footer.about.advice": string;
  "footer.about.klushulp": string;
  "footer.about.careers": string;

  // Footer — onderbalk
  "footer.bottom.copyright": string; // {year}
  "footer.bottom.terms": string;
  "footer.bottom.returnPolicy": string;
  "footer.bottom.privacy": string;
  "footer.bottom.cookies": string;
  "footer.bottom.accessibility": string;
  "footer.bottom.securePaymentVia": string;

  // Taalschakelaar & voorstel-banner
  "lang.label": string;
  "lang.continueIn": string; // {language}
  "lang.dismiss": string;
};

const nl: Messages = {
  "usp.advice": "Advies van ex-schilders",
  "usp.quality": "Professionele kwaliteit",
  "usp.everything": "Alles voor jouw klus",
  "usp.delivery": "Voor 19:00 besteld, morgen in huis",

  "nav.customerService": "Klantenservice",
  "nav.cart": "Winkelwagen",
  "nav.cartAria": "Winkelwagen, {count} artikelen",
  "search.placeholder": "Waar ben je naar op zoek?",

  "footer.newsletter.title": "Mis geen enkele actie",
  "footer.newsletter.text":
    "Schrijf je in voor de nieuwsbrief en ontvang klustips, inspiratie en de scherpste KLUSRPAS-aanbiedingen.",

  "footer.tagline":
    "De beste VERF en alles wat je NÚ nodig hebt voor de klus. Advies van ex-schilders, professionele kwaliteit.",

  "footer.col.assortment": "Assortiment",
  "footer.col.customerService": "Klantenservice",
  "footer.col.about": "Over KLUSR",

  "footer.service.customerService": "Klantenservice",
  "footer.service.faq": "Veelgestelde vragen",
  "footer.service.orderStatus": "Bestelstatus volgen",
  "footer.service.shippingReturns": "Verzending & retour",
  "footer.service.returnPolicy": "Retourvoorwaarden",
  "footer.service.securePayment": "Veilig betalen",
  "footer.service.warranty": "Garantie & service",

  "footer.about.aboutKlusr": "Over KLUSR",
  "footer.about.kluspas": "KLUSRPAS",
  "footer.about.business": "Zakelijk & ProfPas",
  "footer.about.mixPaint": "Mengverf",
  "footer.about.colors": "Alle kleuren & collecties",
  "footer.about.advice": "Advies & inspiratie",
  "footer.about.klushulp": "Klushulp AI",
  "footer.about.careers": "Werken bij KLUSR",

  "footer.bottom.copyright": "© {year} KLUSR B.V. — Alle prijzen incl. btw.",
  "footer.bottom.terms": "Algemene voorwaarden",
  "footer.bottom.returnPolicy": "Retourvoorwaarden",
  "footer.bottom.privacy": "Privacy",
  "footer.bottom.cookies": "Cookiebeleid",
  "footer.bottom.accessibility": "Toegankelijkheid",
  "footer.bottom.securePaymentVia": "Veilig betalen via",

  "lang.label": "Taal",
  "lang.continueIn": "Verdergaan in het {language}?",
  "lang.dismiss": "Sluiten",
};

const en: Messages = {
  "usp.advice": "Advice from former painters",
  "usp.quality": "Professional quality",
  "usp.everything": "Everything for your project",
  "usp.delivery": "Order before 19:00, delivered tomorrow",

  "nav.customerService": "Customer service",
  "nav.cart": "Cart",
  "nav.cartAria": "Cart, {count} items",
  "search.placeholder": "What are you looking for?",

  "footer.newsletter.title": "Never miss a deal",
  "footer.newsletter.text":
    "Sign up for the newsletter and receive DIY tips, inspiration and the sharpest KLUSRPAS offers.",

  "footer.tagline":
    "The best PAINT and everything you need RIGHT NOW for the job. Advice from former painters, professional quality.",

  "footer.col.assortment": "Range",
  "footer.col.customerService": "Customer service",
  "footer.col.about": "About KLUSR",

  "footer.service.customerService": "Customer service",
  "footer.service.faq": "Frequently asked questions",
  "footer.service.orderStatus": "Track your order",
  "footer.service.shippingReturns": "Shipping & returns",
  "footer.service.returnPolicy": "Return policy",
  "footer.service.securePayment": "Secure payment",
  "footer.service.warranty": "Warranty & service",

  "footer.about.aboutKlusr": "About KLUSR",
  "footer.about.kluspas": "KLUSRPAS",
  "footer.about.business": "Business & ProfPas",
  "footer.about.mixPaint": "Mixed paint",
  "footer.about.colors": "All colours & collections",
  "footer.about.advice": "Advice & inspiration",
  "footer.about.klushulp": "Klushulp AI",
  "footer.about.careers": "Careers at KLUSR",

  "footer.bottom.copyright": "© {year} KLUSR B.V. — All prices incl. VAT.",
  "footer.bottom.terms": "Terms & conditions",
  "footer.bottom.returnPolicy": "Return policy",
  "footer.bottom.privacy": "Privacy",
  "footer.bottom.cookies": "Cookie policy",
  "footer.bottom.accessibility": "Accessibility",
  "footer.bottom.securePaymentVia": "Secure payment via",

  "lang.label": "Language",
  "lang.continueIn": "Continue in {language}?",
  "lang.dismiss": "Dismiss",
};

const fr: Messages = {
  "usp.advice": "Conseils d'anciens peintres",
  "usp.quality": "Qualité professionnelle",
  "usp.everything": "Tout pour vos travaux",
  "usp.delivery": "Commandé avant 19h, livré demain",

  "nav.customerService": "Service client",
  "nav.cart": "Panier",
  "nav.cartAria": "Panier, {count} articles",
  "search.placeholder": "Que recherchez-vous ?",

  "footer.newsletter.title": "Ne manquez aucune offre",
  "footer.newsletter.text":
    "Inscrivez-vous à la newsletter et recevez des astuces bricolage, de l'inspiration et les meilleures offres KLUSRPAS.",

  "footer.tagline":
    "La meilleure PEINTURE et tout ce qu'il vous faut MAINTENANT pour vos travaux. Conseils d'anciens peintres, qualité professionnelle.",

  "footer.col.assortment": "Assortiment",
  "footer.col.customerService": "Service client",
  "footer.col.about": "À propos de KLUSR",

  "footer.service.customerService": "Service client",
  "footer.service.faq": "Questions fréquentes",
  "footer.service.orderStatus": "Suivre ma commande",
  "footer.service.shippingReturns": "Livraison & retours",
  "footer.service.returnPolicy": "Conditions de retour",
  "footer.service.securePayment": "Paiement sécurisé",
  "footer.service.warranty": "Garantie & service",

  "footer.about.aboutKlusr": "À propos de KLUSR",
  "footer.about.kluspas": "KLUSRPAS",
  "footer.about.business": "Professionnels & ProfPas",
  "footer.about.mixPaint": "Peinture sur mesure",
  "footer.about.colors": "Toutes les couleurs & collections",
  "footer.about.advice": "Conseils & inspiration",
  "footer.about.klushulp": "Klushulp AI",
  "footer.about.careers": "Carrières chez KLUSR",

  "footer.bottom.copyright": "© {year} KLUSR B.V. — Tous les prix TTC.",
  "footer.bottom.terms": "Conditions générales",
  "footer.bottom.returnPolicy": "Conditions de retour",
  "footer.bottom.privacy": "Confidentialité",
  "footer.bottom.cookies": "Politique en matière de cookies",
  "footer.bottom.accessibility": "Accessibilité",
  "footer.bottom.securePaymentVia": "Paiement sécurisé via",

  "lang.label": "Langue",
  "lang.continueIn": "Continuer en {language} ?",
  "lang.dismiss": "Fermer",
};

const de: Messages = {
  "usp.advice": "Beratung von ehemaligen Malern",
  "usp.quality": "Professionelle Qualität",
  "usp.everything": "Alles für Ihr Projekt",
  "usp.delivery": "Vor 19:00 Uhr bestellt, morgen geliefert",

  "nav.customerService": "Kundenservice",
  "nav.cart": "Warenkorb",
  "nav.cartAria": "Warenkorb, {count} Artikel",
  "search.placeholder": "Wonach suchen Sie?",

  "footer.newsletter.title": "Verpassen Sie kein Angebot",
  "footer.newsletter.text":
    "Melden Sie sich für den Newsletter an und erhalten Sie Heimwerker-Tipps, Inspiration und die besten KLUSRPAS-Angebote.",

  "footer.tagline":
    "Die beste FARBE und alles, was Sie JETZT für Ihr Projekt brauchen. Beratung von ehemaligen Malern, professionelle Qualität.",

  "footer.col.assortment": "Sortiment",
  "footer.col.customerService": "Kundenservice",
  "footer.col.about": "Über KLUSR",

  "footer.service.customerService": "Kundenservice",
  "footer.service.faq": "Häufig gestellte Fragen",
  "footer.service.orderStatus": "Bestellung verfolgen",
  "footer.service.shippingReturns": "Versand & Rückgabe",
  "footer.service.returnPolicy": "Rückgabebedingungen",
  "footer.service.securePayment": "Sicher bezahlen",
  "footer.service.warranty": "Garantie & Service",

  "footer.about.aboutKlusr": "Über KLUSR",
  "footer.about.kluspas": "KLUSRPAS",
  "footer.about.business": "Geschäftskunden & ProfPas",
  "footer.about.mixPaint": "Mischfarbe",
  "footer.about.colors": "Alle Farben & Kollektionen",
  "footer.about.advice": "Beratung & Inspiration",
  "footer.about.klushulp": "Klushulp AI",
  "footer.about.careers": "Karriere bei KLUSR",

  "footer.bottom.copyright": "© {year} KLUSR B.V. — Alle Preise inkl. MwSt.",
  "footer.bottom.terms": "Allgemeine Geschäftsbedingungen",
  "footer.bottom.returnPolicy": "Rückgabebedingungen",
  "footer.bottom.privacy": "Datenschutz",
  "footer.bottom.cookies": "Cookie-Richtlinie",
  "footer.bottom.accessibility": "Barrierefreiheit",
  "footer.bottom.securePaymentVia": "Sicher bezahlen über",

  "lang.label": "Sprache",
  "lang.continueIn": "Auf {language} ansehen?",
  "lang.dismiss": "Schließen",
};

export const dictionaries: Record<Locale, Messages> = { nl, en, fr, de };

export type MessageKey = keyof Messages;
