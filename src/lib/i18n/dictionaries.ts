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

  // ── Homepage ──────────────────────────────────────────────────────────────
  // Hero
  "home.hero.badge": string;
  "home.hero.titleLead": string; // "De beste " (vóór VERF)
  "home.hero.titlePaint": string; // "VERF" (gekleurd accentwoord)
  "home.hero.titleMid": string; // " en alles wat je " (tussen VERF en NÚ)
  "home.hero.titleNow": string; // "NÚ" (gekleurd accentwoord)
  "home.hero.titleTail": string; // " nodig hebt voor de klus!" (na NÚ)
  "home.hero.subtitle": string;
  "home.hero.cta": string;
  "home.hero.klushulp": string;

  // Hero AI-kaart
  "home.heroAi.chip": string;
  "home.heroAi.title": string;
  "home.heroAi.text": string;
  "home.heroAi.placeholder": string;
  "home.heroAi.inputAria": string;
  "home.heroAi.submitAria": string;
  "home.heroAi.example.bedroom": string;
  "home.heroAi.example.liters": string;
  "home.heroAi.example.primer": string;

  // Klushulp-funnel
  "home.funnel.title": string;
  "home.funnel.subtitle": string;

  // Verf-categorieën
  "home.verf.title": string;
  "home.verf.subtitle": string;

  // Populaire producten
  "home.popular.title": string;
  "home.popular.subtitle": string;
  "home.popular.link": string;

  // Acties
  "home.acties.title": string;
  "home.acties.subtitle": string;

  // KLUSRPAS-banner
  "home.kluspas.badge": string;
  "home.kluspas.title": string;
  "home.kluspas.text": string;
  "home.kluspas.cta": string;
  "home.kluspas.benefit1": string;
  "home.kluspas.benefit2": string;
  "home.kluspas.benefit3": string;
  "home.kluspas.benefit4": string;

  // Inspiratie
  "home.inspiration.title": string;
  "home.inspiration.subtitle": string;

  // Categorie-tegels
  "home.categories.title": string;
  "home.categories.subtitle": string;

  // Trending
  "home.trending.link": string;

  // Voor jou
  "home.forYou.title": string;
  "home.forYou.subtitle": string;
  "home.viewed.title": string;
  "home.viewed.subtitle": string;

  // ── Winkelwagen ───────────────────────────────────────────────────────────
  "cart.title": string;
  "cart.loading": string;
  "cart.empty.title": string;
  "cart.empty.drawerText": string;
  "cart.empty.viewText": string;
  "cart.empty.startPaint": string;
  "cart.empty.viewPaint": string;
  "cart.empty.klushulp": string;

  // Vrije-verzending-balk
  "cart.freeShipping.reachedPre": string;
  "cart.freeShipping.reachedBold": string;
  "cart.freeShipping.reachedPost": string;
  "cart.freeShipping.remainingPre": string;
  "cart.freeShipping.remainingPost": string;

  // Item-acties
  "cart.item.remove": string;
  "cart.item.save": string;
  "cart.item.removeLabel": string;
  "cart.item.add": string;
  "cart.forgotten": string;
  "cart.moveToCart": string;
  "cart.savedForLater": string; // {count}

  // Overzicht / totalen
  "cart.summary.title": string;
  "cart.kluspasDiscount": string;
  "cart.profpasDiscount": string;
  "cart.subtotal": string;
  "cart.exclVat": string; // " (excl. btw)" — achtervoegsel
  "cart.shipping": string;
  "cart.free": string;
  "cart.vat": string;
  "cart.total": string;
  "cart.vatIncluded": string;
  "cart.vatIncludedBusiness": string;
  "cart.checkout": string;
  "cart.continueShopping": string;
  "cart.toCart": string;

  // USP's in het overzicht
  "cart.usp.returns": string;
  "cart.usp.payment": string;

  // Upsell
  "cart.upsell.title": string;
  "cart.upsell.subtitle": string;
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

  "home.hero.badge": "Advies van ex-schilders",
  "home.hero.titleLead": "De beste ",
  "home.hero.titlePaint": "VERF",
  "home.hero.titleMid": " en alles wat je ",
  "home.hero.titleNow": "NÚ",
  "home.hero.titleTail": " nodig hebt voor de klus!",
  "home.hero.subtitle":
    "Professionele kwaliteit, op kleur gemengd. Van binnen- en buitenverf tot gereedschap, ijzerwaren en elektra.",
  "home.hero.cta": "Bekijk ons assortiment",
  "home.hero.klushulp": "Klushulp",

  "home.heroAi.chip": "Klushulp · advies van ex-schilders",
  "home.heroAi.title": "Wat ga je klussen?",
  "home.heroAi.text":
    "Stel direct je vraag — onze klushulp helpt je met verf, hoeveelheden en het juiste gereedschap.",
  "home.heroAi.placeholder": "Bijv. welke verf voor mijn badkamer?",
  "home.heroAi.inputAria": "Stel je klusvraag aan de klushulp",
  "home.heroAi.submitAria": "Vraag de klushulp",
  "home.heroAi.example.bedroom": "Welke verf voor mijn slaapkamer?",
  "home.heroAi.example.liters": "Hoeveel liter heb ik nodig?",
  "home.heroAi.example.primer": "Welke primer op kaal hout?",

  "home.funnel.title": "Wat ga je doen?",
  "home.funnel.subtitle": "Kies je klus en wij helpen je met de juiste producten en advies.",

  "home.verf.title": "Verf — onze specialiteit",
  "home.verf.subtitle": "Op kleur gemengd, professionele kwaliteit",

  "home.popular.title": "Populaire producten",
  "home.popular.subtitle": "De favorieten van onze klussers",
  "home.popular.link": "Meer producten",

  "home.acties.title": "Acties & aanbiedingen",
  "home.acties.subtitle": "Tijdelijk extra voordeel",

  "home.kluspas.badge": "KLUSPAS",
  "home.kluspas.title": "Word lid en betaal altijd de laagste prijs",
  "home.kluspas.text":
    "Met de gratis KLUSRPAS profiteer je direct van KLUSRPAS-prijzen op het hele assortiment en mis je geen enkele actie.",
  "home.kluspas.cta": "Vraag je KLUSRPAS aan",
  "home.kluspas.benefit1": "Altijd de scherpste KLUSRPAS-prijs",
  "home.kluspas.benefit2": "Exclusieve acties en voorrang bij uitverkoop",
  "home.kluspas.benefit3": "Gratis kleuradvies in de winkel",
  "home.kluspas.benefit4": "Spaar voor klustegoed",

  "home.inspiration.title": "Inspiratie & advies",
  "home.inspiration.subtitle": "Klustips en stappenplannen van onze experts",

  "home.categories.title": "Shop per categorie",
  "home.categories.subtitle": "Alles voor jouw klus onder één dak",

  "home.trending.link": "Bekijk alles",

  "home.forYou.title": "Speciaal voor jou",
  "home.forYou.subtitle": "Aanbevolen op basis van wat je bekeek en bestelde",
  "home.viewed.title": "Verder kijken",
  "home.viewed.subtitle": "Onlangs door jou bekeken",

  "cart.title": "Winkelwagen",
  "cart.loading": "Laden…",
  "cart.empty.title": "Je winkelwagen is leeg",
  "cart.empty.drawerText": "Voeg producten toe om je klus compleet te maken.",
  "cart.empty.viewText": "Bekijk ons assortiment en maak je klus compleet.",
  "cart.empty.startPaint": "Begin met verf",
  "cart.empty.viewPaint": "Bekijk verf",
  "cart.empty.klushulp": "Klushulp",

  "cart.freeShipping.reachedPre": "Gefeliciteerd! Je krijgt ",
  "cart.freeShipping.reachedBold": "gratis verzending",
  "cart.freeShipping.reachedPost": ".",
  "cart.freeShipping.remainingPre": "Nog ",
  "cart.freeShipping.remainingPost": " tot gratis verzending",

  "cart.item.remove": "Verwijder",
  "cart.item.save": "Bewaar",
  "cart.item.removeLabel": "Verwijder",
  "cart.item.add": "Toevoegen",
  "cart.forgotten": "Vaak vergeten",
  "cart.moveToCart": "In winkelwagen",
  "cart.savedForLater": "Bewaard voor later ({count})",

  "cart.summary.title": "Overzicht",
  "cart.kluspasDiscount": "KLUSRPAS-voordeel",
  "cart.profpasDiscount": "ProfPas-korting",
  "cart.subtotal": "Subtotaal",
  "cart.exclVat": " (excl. btw)",
  "cart.shipping": "Verzendkosten",
  "cart.free": "Gratis",
  "cart.vat": "Btw (21%)",
  "cart.total": "Totaal",
  "cart.vatIncluded": "Incl. btw",
  "cart.vatIncludedBusiness": "Incl. btw · zakelijke prijzen excl. btw getoond",
  "cart.checkout": "Verder naar afrekenen",
  "cart.continueShopping": "Verder winkelen",
  "cart.toCart": "Naar winkelwagen",

  "cart.usp.returns": "Gratis retouren in de winkel",
  "cart.usp.payment": "Veilig betalen via Mollie",

  "cart.upsell.title": "Maak je klus compleet",
  "cart.upsell.subtitle": "Klussers kochten hier vaak ook",
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

  "home.hero.badge": "Advice from former painters",
  "home.hero.titleLead": "The best ",
  "home.hero.titlePaint": "PAINT",
  "home.hero.titleMid": " and everything you ",
  "home.hero.titleNow": "RIGHT NOW",
  "home.hero.titleTail": " need for the job!",
  "home.hero.subtitle":
    "Professional quality, mixed to colour. From interior and exterior paint to tools, hardware and electrical.",
  "home.hero.cta": "Browse our range",
  "home.hero.klushulp": "Klushulp",

  "home.heroAi.chip": "Klushulp · advice from former painters",
  "home.heroAi.title": "What's your project?",
  "home.heroAi.text":
    "Ask your question right away — our Klushulp helps you with paint, quantities and the right tools.",
  "home.heroAi.placeholder": "E.g. which paint for my bathroom?",
  "home.heroAi.inputAria": "Ask your project question to Klushulp",
  "home.heroAi.submitAria": "Ask Klushulp",
  "home.heroAi.example.bedroom": "Which paint for my bedroom?",
  "home.heroAi.example.liters": "How many litres do I need?",
  "home.heroAi.example.primer": "Which primer on bare wood?",

  "home.funnel.title": "What are you up to?",
  "home.funnel.subtitle": "Choose your project and we'll help you with the right products and advice.",

  "home.verf.title": "Paint — our speciality",
  "home.verf.subtitle": "Mixed to colour, professional quality",

  "home.popular.title": "Popular products",
  "home.popular.subtitle": "Our DIYers' favourites",
  "home.popular.link": "More products",

  "home.acties.title": "Deals & offers",
  "home.acties.subtitle": "Extra savings for a limited time",

  "home.kluspas.badge": "KLUSPAS",
  "home.kluspas.title": "Become a member and always pay the lowest price",
  "home.kluspas.text":
    "With the free KLUSRPAS you instantly get KLUSRPAS prices across the entire range and never miss a deal.",
  "home.kluspas.cta": "Apply for your KLUSRPAS",
  "home.kluspas.benefit1": "Always the sharpest KLUSRPAS price",
  "home.kluspas.benefit2": "Exclusive deals and priority during sales",
  "home.kluspas.benefit3": "Free colour advice in store",
  "home.kluspas.benefit4": "Save up for project credit",

  "home.inspiration.title": "Inspiration & advice",
  "home.inspiration.subtitle": "DIY tips and step-by-step guides from our experts",

  "home.categories.title": "Shop by category",
  "home.categories.subtitle": "Everything for your project under one roof",

  "home.trending.link": "View all",

  "home.forYou.title": "Just for you",
  "home.forYou.subtitle": "Recommended based on what you viewed and ordered",
  "home.viewed.title": "Keep browsing",
  "home.viewed.subtitle": "Recently viewed by you",

  "cart.title": "Cart",
  "cart.loading": "Loading…",
  "cart.empty.title": "Your cart is empty",
  "cart.empty.drawerText": "Add products to complete your project.",
  "cart.empty.viewText": "Browse our range and complete your project.",
  "cart.empty.startPaint": "Start with paint",
  "cart.empty.viewPaint": "Browse paint",
  "cart.empty.klushulp": "Klushulp",

  "cart.freeShipping.reachedPre": "Congratulations! You get ",
  "cart.freeShipping.reachedBold": "free shipping",
  "cart.freeShipping.reachedPost": ".",
  "cart.freeShipping.remainingPre": "Just ",
  "cart.freeShipping.remainingPost": " to go for free shipping",

  "cart.item.remove": "Remove",
  "cart.item.save": "Save",
  "cart.item.removeLabel": "Remove",
  "cart.item.add": "Add",
  "cart.forgotten": "Often forgotten",
  "cart.moveToCart": "Add to cart",
  "cart.savedForLater": "Saved for later ({count})",

  "cart.summary.title": "Summary",
  "cart.kluspasDiscount": "KLUSRPAS benefit",
  "cart.profpasDiscount": "ProfPas discount",
  "cart.subtotal": "Subtotal",
  "cart.exclVat": " (excl. VAT)",
  "cart.shipping": "Shipping",
  "cart.free": "Free",
  "cart.vat": "VAT (21%)",
  "cart.total": "Total",
  "cart.vatIncluded": "Incl. VAT",
  "cart.vatIncludedBusiness": "Incl. VAT · business prices shown excl. VAT",
  "cart.checkout": "Proceed to checkout",
  "cart.continueShopping": "Continue shopping",
  "cart.toCart": "Go to cart",

  "cart.usp.returns": "Free returns in store",
  "cart.usp.payment": "Secure payment via Mollie",

  "cart.upsell.title": "Complete your project",
  "cart.upsell.subtitle": "DIYers often also bought",
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

  "home.hero.badge": "Conseils d'anciens peintres",
  "home.hero.titleLead": "La meilleure ",
  "home.hero.titlePaint": "PEINTURE",
  "home.hero.titleMid": " et tout ce qu'il vous faut ",
  "home.hero.titleNow": "MAINTENANT",
  "home.hero.titleTail": " pour vos travaux !",
  "home.hero.subtitle":
    "Qualité professionnelle, teintée sur mesure. De la peinture intérieure et extérieure à l'outillage, la quincaillerie et l'électricité.",
  "home.hero.cta": "Découvrir notre assortiment",
  "home.hero.klushulp": "Klushulp",

  "home.heroAi.chip": "Klushulp · conseils d'anciens peintres",
  "home.heroAi.title": "Quels sont vos travaux ?",
  "home.heroAi.text":
    "Posez votre question tout de suite — notre Klushulp vous aide avec la peinture, les quantités et le bon outillage.",
  "home.heroAi.placeholder": "Ex. quelle peinture pour ma salle de bain ?",
  "home.heroAi.inputAria": "Posez votre question travaux à Klushulp",
  "home.heroAi.submitAria": "Demander à Klushulp",
  "home.heroAi.example.bedroom": "Quelle peinture pour ma chambre ?",
  "home.heroAi.example.liters": "Combien de litres me faut-il ?",
  "home.heroAi.example.primer": "Quel primaire sur bois brut ?",

  "home.funnel.title": "Que comptez-vous faire ?",
  "home.funnel.subtitle": "Choisissez vos travaux et nous vous aidons avec les bons produits et des conseils.",

  "home.verf.title": "Peinture — notre spécialité",
  "home.verf.subtitle": "Teintée sur mesure, qualité professionnelle",

  "home.popular.title": "Produits populaires",
  "home.popular.subtitle": "Les préférés de nos bricoleurs",
  "home.popular.link": "Plus de produits",

  "home.acties.title": "Promotions & offres",
  "home.acties.subtitle": "Avantage supplémentaire pour une durée limitée",

  "home.kluspas.badge": "KLUSPAS",
  "home.kluspas.title": "Devenez membre et payez toujours le prix le plus bas",
  "home.kluspas.text":
    "Avec la KLUSRPAS gratuite, vous profitez immédiatement des prix KLUSRPAS sur tout l'assortiment et ne manquez aucune promotion.",
  "home.kluspas.cta": "Demandez votre KLUSRPAS",
  "home.kluspas.benefit1": "Toujours le meilleur prix KLUSRPAS",
  "home.kluspas.benefit2": "Promotions exclusives et priorité lors des soldes",
  "home.kluspas.benefit3": "Conseils couleur gratuits en magasin",
  "home.kluspas.benefit4": "Cumulez un avoir travaux",

  "home.inspiration.title": "Inspiration & conseils",
  "home.inspiration.subtitle": "Astuces bricolage et guides étape par étape de nos experts",

  "home.categories.title": "Acheter par catégorie",
  "home.categories.subtitle": "Tout pour vos travaux sous un même toit",

  "home.trending.link": "Tout voir",

  "home.forYou.title": "Rien que pour vous",
  "home.forYou.subtitle": "Recommandé selon ce que vous avez consulté et commandé",
  "home.viewed.title": "Continuer à explorer",
  "home.viewed.subtitle": "Récemment consultés par vous",

  "cart.title": "Panier",
  "cart.loading": "Chargement…",
  "cart.empty.title": "Votre panier est vide",
  "cart.empty.drawerText": "Ajoutez des produits pour compléter vos travaux.",
  "cart.empty.viewText": "Parcourez notre assortiment et complétez vos travaux.",
  "cart.empty.startPaint": "Commencer par la peinture",
  "cart.empty.viewPaint": "Voir la peinture",
  "cart.empty.klushulp": "Klushulp",

  "cart.freeShipping.reachedPre": "Félicitations ! Vous bénéficiez de la ",
  "cart.freeShipping.reachedBold": "livraison gratuite",
  "cart.freeShipping.reachedPost": ".",
  "cart.freeShipping.remainingPre": "Plus que ",
  "cart.freeShipping.remainingPost": " pour la livraison gratuite",

  "cart.item.remove": "Supprimer",
  "cart.item.save": "Garder",
  "cart.item.removeLabel": "Supprimer",
  "cart.item.add": "Ajouter",
  "cart.forgotten": "Souvent oubliés",
  "cart.moveToCart": "Au panier",
  "cart.savedForLater": "Gardés pour plus tard ({count})",

  "cart.summary.title": "Récapitulatif",
  "cart.kluspasDiscount": "Avantage KLUSRPAS",
  "cart.profpasDiscount": "Remise ProfPas",
  "cart.subtotal": "Sous-total",
  "cart.exclVat": " (hors TVA)",
  "cart.shipping": "Frais de livraison",
  "cart.free": "Gratuit",
  "cart.vat": "TVA (21 %)",
  "cart.total": "Total",
  "cart.vatIncluded": "TVA incluse",
  "cart.vatIncludedBusiness": "TVA incluse · prix professionnels affichés hors TVA",
  "cart.checkout": "Passer à la caisse",
  "cart.continueShopping": "Continuer mes achats",
  "cart.toCart": "Voir le panier",

  "cart.usp.returns": "Retours gratuits en magasin",
  "cart.usp.payment": "Paiement sécurisé via Mollie",

  "cart.upsell.title": "Complétez vos travaux",
  "cart.upsell.subtitle": "Les bricoleurs ont souvent aussi acheté",
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

  "home.hero.badge": "Beratung von ehemaligen Malern",
  "home.hero.titleLead": "Die beste ",
  "home.hero.titlePaint": "FARBE",
  "home.hero.titleMid": " und alles, was Sie ",
  "home.hero.titleNow": "JETZT",
  "home.hero.titleTail": " brauchen!",
  "home.hero.subtitle":
    "Professionelle Qualität, nach Farbton gemischt. Von Innen- und Außenfarbe bis zu Werkzeug, Eisenwaren und Elektro.",
  "home.hero.cta": "Sortiment ansehen",
  "home.hero.klushulp": "Klushulp",

  "home.heroAi.chip": "Klushulp · Beratung von ehemaligen Malern",
  "home.heroAi.title": "Was steht an?",
  "home.heroAi.text":
    "Stellen Sie direkt Ihre Frage — unser Klushulp hilft Ihnen bei Farbe, Mengen und dem richtigen Werkzeug.",
  "home.heroAi.placeholder": "Z. B. welche Farbe für mein Badezimmer?",
  "home.heroAi.inputAria": "Stellen Sie Ihre Projektfrage an Klushulp",
  "home.heroAi.submitAria": "Klushulp fragen",
  "home.heroAi.example.bedroom": "Welche Farbe für mein Schlafzimmer?",
  "home.heroAi.example.liters": "Wie viele Liter brauche ich?",
  "home.heroAi.example.primer": "Welche Grundierung auf rohem Holz?",

  "home.funnel.title": "Was haben Sie vor?",
  "home.funnel.subtitle": "Wählen Sie Ihr Projekt und wir helfen Ihnen mit den richtigen Produkten und Tipps.",

  "home.verf.title": "Farbe — unsere Spezialität",
  "home.verf.subtitle": "Nach Farbton gemischt, professionelle Qualität",

  "home.popular.title": "Beliebte Produkte",
  "home.popular.subtitle": "Die Favoriten unserer Heimwerker",
  "home.popular.link": "Mehr Produkte",

  "home.acties.title": "Aktionen & Angebote",
  "home.acties.subtitle": "Vorübergehend zusätzlicher Vorteil",

  "home.kluspas.badge": "KLUSPAS",
  "home.kluspas.title": "Werden Sie Mitglied und zahlen Sie immer den niedrigsten Preis",
  "home.kluspas.text":
    "Mit der kostenlosen KLUSRPAS profitieren Sie sofort von KLUSRPAS-Preisen auf das gesamte Sortiment und verpassen keine Aktion.",
  "home.kluspas.cta": "KLUSRPAS beantragen",
  "home.kluspas.benefit1": "Immer der beste KLUSRPAS-Preis",
  "home.kluspas.benefit2": "Exklusive Aktionen und Vorrang im Ausverkauf",
  "home.kluspas.benefit3": "Kostenlose Farbberatung im Geschäft",
  "home.kluspas.benefit4": "Sammeln Sie Projekt-Guthaben",

  "home.inspiration.title": "Inspiration & Beratung",
  "home.inspiration.subtitle": "Heimwerker-Tipps und Schritt-für-Schritt-Anleitungen unserer Experten",

  "home.categories.title": "Nach Kategorie shoppen",
  "home.categories.subtitle": "Alles für Ihr Projekt unter einem Dach",

  "home.trending.link": "Alles ansehen",

  "home.forYou.title": "Speziell für Sie",
  "home.forYou.subtitle": "Empfohlen auf Basis dessen, was Sie angesehen und bestellt haben",
  "home.viewed.title": "Weiter stöbern",
  "home.viewed.subtitle": "Kürzlich von Ihnen angesehen",

  "cart.title": "Warenkorb",
  "cart.loading": "Wird geladen…",
  "cart.empty.title": "Ihr Warenkorb ist leer",
  "cart.empty.drawerText": "Fügen Sie Produkte hinzu, um Ihr Projekt zu vervollständigen.",
  "cart.empty.viewText": "Sehen Sie sich unser Sortiment an und vervollständigen Sie Ihr Projekt.",
  "cart.empty.startPaint": "Mit Farbe beginnen",
  "cart.empty.viewPaint": "Farbe ansehen",
  "cart.empty.klushulp": "Klushulp",

  "cart.freeShipping.reachedPre": "Herzlichen Glückwunsch! Sie erhalten ",
  "cart.freeShipping.reachedBold": "kostenlosen Versand",
  "cart.freeShipping.reachedPost": ".",
  "cart.freeShipping.remainingPre": "Noch ",
  "cart.freeShipping.remainingPost": " bis zum kostenlosen Versand",

  "cart.item.remove": "Entfernen",
  "cart.item.save": "Merken",
  "cart.item.removeLabel": "Entfernen",
  "cart.item.add": "Hinzufügen",
  "cart.forgotten": "Oft vergessen",
  "cart.moveToCart": "In den Warenkorb",
  "cart.savedForLater": "Für später gemerkt ({count})",

  "cart.summary.title": "Übersicht",
  "cart.kluspasDiscount": "KLUSRPAS-Vorteil",
  "cart.profpasDiscount": "ProfPas-Rabatt",
  "cart.subtotal": "Zwischensumme",
  "cart.exclVat": " (zzgl. MwSt.)",
  "cart.shipping": "Versandkosten",
  "cart.free": "Kostenlos",
  "cart.vat": "MwSt. (21 %)",
  "cart.total": "Gesamt",
  "cart.vatIncluded": "Inkl. MwSt.",
  "cart.vatIncludedBusiness": "Inkl. MwSt. · Geschäftspreise zzgl. MwSt. angezeigt",
  "cart.checkout": "Weiter zur Kasse",
  "cart.continueShopping": "Weiter einkaufen",
  "cart.toCart": "Zum Warenkorb",

  "cart.usp.returns": "Kostenlose Rückgabe im Geschäft",
  "cart.usp.payment": "Sicher bezahlen über Mollie",

  "cart.upsell.title": "Vervollständigen Sie Ihr Projekt",
  "cart.upsell.subtitle": "Heimwerker kauften hier oft auch",
};

export const dictionaries: Record<Locale, Messages> = { nl, en, fr, de };

export type MessageKey = keyof Messages;
