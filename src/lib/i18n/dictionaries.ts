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

  // ── Afrekenen (checkout) ──────────────────────────────────────────────────
  "checkout.title": string;
  "checkout.backToCart": string;
  "checkout.empty.text": string;
  "checkout.empty.toRange": string;

  // Particulier / zakelijk
  "checkout.private": string;
  "checkout.business": string;

  // Nabestel-/gratis-verzending-melding
  "checkout.reorderFree": string;

  // Account-funnel
  "checkout.loggedInPre": string; // vóór het e-mailadres
  "checkout.loggedInPost": string; // ná het e-mailadres
  "checkout.guest.title": string;
  "checkout.guest.text": string;
  "checkout.guest.haveAccount": string;
  "checkout.login.emailPlaceholder": string;
  "checkout.login.passwordPlaceholder": string;
  "checkout.login.submit": string;
  "checkout.login.error": string;
  "checkout.login.forgotPre": string; // vóór de inloglink
  "checkout.login.forgotLink": string;

  // Stap-koppen
  "checkout.section.contact": string;
  "checkout.section.delivery": string;
  "checkout.section.shipping": string;
  "checkout.section.payment": string;

  // Contactgegevens
  "checkout.field.email": string;
  "checkout.field.emailPlaceholder": string;
  "checkout.createAccount.labelBold": string;
  "checkout.createAccount.labelRest": string;
  "checkout.createAccount.optional": string;
  "checkout.createAccount.passwordPlaceholder": string;
  "checkout.createAccount.passwordHint": string;
  "checkout.field.company": string;
  "checkout.field.companyPlaceholder": string;
  "checkout.field.coc": string;
  "checkout.field.vat": string;

  // Bezorgadres
  "checkout.field.country": string;
  "checkout.country.outsideNote": string;
  "checkout.field.firstName": string;
  "checkout.field.lastName": string;
  "checkout.field.postalCode": string;
  "checkout.field.houseNumber": string;
  "checkout.field.addition": string;
  "checkout.field.street": string;
  "checkout.field.streetLookup": string;
  "checkout.field.autofill": string;
  "checkout.field.city": string;
  "checkout.field.phone": string;
  "checkout.billing.toggle": string;
  "checkout.billing.companyOptional": string;
  "checkout.billing.streetAndNumber": string;
  "checkout.billing.streetPlaceholder": string;

  // Verzendmethode
  "checkout.delivery.title": string;

  // Overzicht
  "checkout.summary.title": string;
  "checkout.billieSurcharge": string;
  "checkout.terms.pre": string; // "Ik ga akkoord met de "
  "checkout.terms.termsLink": string;
  "checkout.terms.mid": string; // " en het "
  "checkout.terms.privacyLink": string;
  "checkout.terms.post": string; // "."
  "checkout.newsletter": string;
  "checkout.pay": string; // {amount}
  "checkout.chooseBankHint": string;
  "checkout.choosePaymentHint": string;
  "checkout.usp.freeReturn": string;
  "checkout.usp.fastDelivery": string;

  // Validatie / fouten (binnen de component bereikbaar)
  "checkout.error.choosePayment": string;
  "checkout.error.chooseBank": string;
  "checkout.error.accountPassword": string;
  "checkout.error.card": string;
  "checkout.error.paymentFailed": string;
  "checkout.error.generic": string;

  // Betaalmethoden (zichtbare labels)
  "checkout.payment.chooseBank": string;
  "checkout.payment.hint.ideal": string;
  "checkout.payment.hint.creditcard": string;
  "checkout.payment.hint.klarna": string;
  "checkout.payment.hint.bancontact": string;

  // Reorder-upsell ("Iets vergeten?")
  "checkout.reorder.title": string;
  "checkout.reorder.textPre": string; // "Bestel binnen "
  "checkout.reorder.textMinutes": string; // "15 minuten"
  "checkout.reorder.textMid": string; // " nog iets en betaal "
  "checkout.reorder.textBold": string; // "geen extra verzendkosten"
  "checkout.reorder.textPost": string; // " — we sturen het in één pakket."
  "checkout.reorder.added": string;
  "checkout.reorder.addAria": string; // {title}
  "checkout.reorder.toCart": string;
  "checkout.reorder.continueShopping": string;

  // Bedankpagina
  "checkout.thanks.title": string;
  "checkout.thanks.text": string;
  "checkout.thanks.confirmationSentPre": string; // " Een bevestiging is verstuurd naar "
  "checkout.thanks.confirmationSentPost": string; // "."
  "checkout.thanks.orderNumber": string;
  "checkout.thanks.orderDate": string;
  "checkout.thanks.subtotal": string;
  "checkout.thanks.shipping": string;
  "checkout.thanks.totalPaid": string;
  "checkout.thanks.free": string;
  "checkout.thanks.expectedDelivery": string; // {date}
  "checkout.thanks.step.confirmation.title": string;
  "checkout.thanks.step.confirmation.hint": string;
  "checkout.thanks.step.packing.title": string;
  "checkout.thanks.step.packing.hint": string;
  "checkout.thanks.step.onTheWay.title": string;
  "checkout.thanks.step.onTheWay.hint": string;
  "checkout.thanks.trackOrder": string;
  "checkout.thanks.continueShopping": string;
  "checkout.thanks.downloadInvoice": string;
  "checkout.thanks.deliveryAddress": string;
  "checkout.thanks.loadError": string;
  "checkout.thanks.backHome": string;
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

  "checkout.title": "Afrekenen",
  "checkout.backToCart": "Terug naar winkelwagen",
  "checkout.empty.text": "Voeg eerst producten toe om af te rekenen.",
  "checkout.empty.toRange": "Naar het assortiment",

  "checkout.private": "Particulier",
  "checkout.business": "Zakelijk (excl. btw)",

  "checkout.reorderFree":
    "Gratis verzending — je bestelt binnen 15 minuten na je vorige bestelling.",

  "checkout.loggedInPre": "Je bent ingelogd als ",
  "checkout.loggedInPost": ". Je bestelling wordt aan je account gekoppeld.",
  "checkout.guest.title": "Je rekent af als gast — supersnel, geen account nodig",
  "checkout.guest.text":
    "Vul je gegevens in en bestel direct. Onderaan maak je met één vinkje een account aan voor je bestelhistorie.",
  "checkout.guest.haveAccount": "Heb je al een account? Inloggen",
  "checkout.login.emailPlaceholder": "E-mailadres",
  "checkout.login.passwordPlaceholder": "Wachtwoord",
  "checkout.login.submit": "Inloggen",
  "checkout.login.error": "Inloggen mislukt. Controleer je e-mailadres en wachtwoord.",
  "checkout.login.forgotPre": "Wachtwoord vergeten of liever een inloglink? ",
  "checkout.login.forgotLink": "Ga naar inloggen",

  "checkout.section.contact": "Contactgegevens",
  "checkout.section.delivery": "Bezorgadres",
  "checkout.section.shipping": "Verzendmethode",
  "checkout.section.payment": "Betaalmethode",

  "checkout.field.email": "E-mailadres",
  "checkout.field.emailPlaceholder": "jij@voorbeeld.nl",
  "checkout.createAccount.labelBold": "Maak meteen een account aan",
  "checkout.createAccount.labelRest": " — bewaar je gegevens en bekijk later je bestellingen. ",
  "checkout.createAccount.optional": "(optioneel)",
  "checkout.createAccount.passwordPlaceholder": "Kies een wachtwoord (min. 8 tekens)",
  "checkout.createAccount.passwordHint": "Minimaal 8 tekens.",
  "checkout.field.company": "Bedrijfsnaam",
  "checkout.field.companyPlaceholder": "Bedrijfsnaam B.V.",
  "checkout.field.coc": "KVK-nummer (optioneel)",
  "checkout.field.vat": "BTW-nummer (optioneel)",

  "checkout.field.country": "Land",
  "checkout.country.outsideNote":
    "Buiten NL en BE gelden vaste verzendkosten (geen gratis verzending).",
  "checkout.field.firstName": "Voornaam",
  "checkout.field.lastName": "Achternaam",
  "checkout.field.postalCode": "Postcode",
  "checkout.field.houseNumber": "Huisnr.",
  "checkout.field.addition": "Toevoeging",
  "checkout.field.street": "Straat",
  "checkout.field.streetLookup": "Straat (adres ophalen…)",
  "checkout.field.autofill": "Wordt automatisch ingevuld",
  "checkout.field.city": "Plaats",
  "checkout.field.phone": "Telefoon (optioneel)",
  "checkout.billing.toggle": "Factuuradres wijkt af van het bezorgadres",
  "checkout.billing.companyOptional": "Bedrijfsnaam (optioneel)",
  "checkout.billing.streetAndNumber": "Straat en huisnummer",
  "checkout.billing.streetPlaceholder": "Straatnaam 1",

  "checkout.delivery.title": "Bezorgen",

  "checkout.summary.title": "Je bestelling",
  "checkout.billieSurcharge": "Billie-toeslag",
  "checkout.terms.pre": "Ik ga akkoord met de ",
  "checkout.terms.termsLink": "algemene voorwaarden",
  "checkout.terms.mid": " en het ",
  "checkout.terms.privacyLink": "privacybeleid",
  "checkout.terms.post": ".",
  "checkout.newsletter":
    "Houd me op de hoogte van klustips en KLUSRPAS-aanbiedingen (nieuwsbrief).",
  "checkout.pay": "Betaal {amount}",
  "checkout.chooseBankHint": "Kies je bank om verder te gaan.",
  "checkout.choosePaymentHint": "Kies eerst een betaalmethode.",
  "checkout.usp.freeReturn": "Gratis retour",
  "checkout.usp.fastDelivery": "Snelle levering",

  "checkout.error.choosePayment": "Kies eerst een betaalmethode.",
  "checkout.error.chooseBank": "Kies eerst je bank voor iDEAL.",
  "checkout.error.accountPassword":
    "Kies een wachtwoord van minimaal 8 tekens voor je account.",
  "checkout.error.card": "Controleer je kaartgegevens en probeer het opnieuw.",
  "checkout.error.paymentFailed": "Betaling aanmaken mislukt",
  "checkout.error.generic": "Er ging iets mis",

  "checkout.payment.chooseBank": "Kies je bank",
  "checkout.payment.hint.ideal": "Betaal direct met je eigen bank",
  "checkout.payment.hint.creditcard": "Visa, Mastercard",
  "checkout.payment.hint.klarna": "Achteraf betalen — binnen 14 dagen",
  "checkout.payment.hint.bancontact": "Betaal met je Bancontact-kaart",

  "checkout.reorder.title": "Iets vergeten?",
  "checkout.reorder.textPre": "Bestel binnen ",
  "checkout.reorder.textMinutes": "15 minuten",
  "checkout.reorder.textMid": " nog iets en betaal ",
  "checkout.reorder.textBold": "geen extra verzendkosten",
  "checkout.reorder.textPost": " — we sturen het in één pakket.",
  "checkout.reorder.added": "Toegevoegd — geen extra verzendkosten",
  "checkout.reorder.addAria": "Voeg {title} toe",
  "checkout.reorder.toCart": "Naar winkelwagen",
  "checkout.reorder.continueShopping": "Verder winkelen",

  "checkout.thanks.title": "Bedankt voor je bestelling!",
  "checkout.thanks.text":
    "We hebben je bestelling ontvangen en gaan er direct mee aan de slag.",
  "checkout.thanks.confirmationSentPre": " Een bevestiging is verstuurd naar ",
  "checkout.thanks.confirmationSentPost": ".",
  "checkout.thanks.orderNumber": "Bestelnummer",
  "checkout.thanks.orderDate": "Besteldatum",
  "checkout.thanks.subtotal": "Subtotaal",
  "checkout.thanks.shipping": "Verzendkosten",
  "checkout.thanks.totalPaid": "Totaal betaald",
  "checkout.thanks.free": "Gratis",
  "checkout.thanks.expectedDelivery": "Verwachte bezorging: {date}",
  "checkout.thanks.step.confirmation.title": "Bevestiging",
  "checkout.thanks.step.confirmation.hint": "Check je inbox",
  "checkout.thanks.step.packing.title": "Wordt ingepakt",
  "checkout.thanks.step.packing.hint": "Vandaag nog",
  "checkout.thanks.step.onTheWay.title": "Onderweg",
  "checkout.thanks.step.onTheWay.hint": "Volg je pakket",
  "checkout.thanks.trackOrder": "Volg je bestelling",
  "checkout.thanks.continueShopping": "Verder winkelen",
  "checkout.thanks.downloadInvoice": "Download je factuur (PDF)",
  "checkout.thanks.deliveryAddress": "Bezorgadres",
  "checkout.thanks.loadError":
    "We konden de bestelgegevens niet laden, maar je betaling is in goede orde ontvangen. Je ontvangt een bevestiging per e-mail.",
  "checkout.thanks.backHome": "Terug naar home",
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

  "checkout.title": "Checkout",
  "checkout.backToCart": "Back to cart",
  "checkout.empty.text": "Add products first to check out.",
  "checkout.empty.toRange": "Go to the range",

  "checkout.private": "Personal",
  "checkout.business": "Business (excl. VAT)",

  "checkout.reorderFree":
    "Free shipping — you're ordering within 15 minutes of your previous order.",

  "checkout.loggedInPre": "You're logged in as ",
  "checkout.loggedInPost": ". Your order will be linked to your account.",
  "checkout.guest.title": "You're checking out as a guest — super fast, no account needed",
  "checkout.guest.text":
    "Enter your details and order straight away. At the bottom you can create an account with a single tick for your order history.",
  "checkout.guest.haveAccount": "Already have an account? Log in",
  "checkout.login.emailPlaceholder": "Email address",
  "checkout.login.passwordPlaceholder": "Password",
  "checkout.login.submit": "Log in",
  "checkout.login.error": "Login failed. Please check your email address and password.",
  "checkout.login.forgotPre": "Forgot your password or prefer a login link? ",
  "checkout.login.forgotLink": "Go to log in",

  "checkout.section.contact": "Contact details",
  "checkout.section.delivery": "Delivery address",
  "checkout.section.shipping": "Shipping method",
  "checkout.section.payment": "Payment method",

  "checkout.field.email": "Email address",
  "checkout.field.emailPlaceholder": "you@example.com",
  "checkout.createAccount.labelBold": "Create an account right away",
  "checkout.createAccount.labelRest": " — save your details and view your orders later. ",
  "checkout.createAccount.optional": "(optional)",
  "checkout.createAccount.passwordPlaceholder": "Choose a password (min. 8 characters)",
  "checkout.createAccount.passwordHint": "At least 8 characters.",
  "checkout.field.company": "Company name",
  "checkout.field.companyPlaceholder": "Company Ltd.",
  "checkout.field.coc": "CoC number (optional)",
  "checkout.field.vat": "VAT number (optional)",

  "checkout.field.country": "Country",
  "checkout.country.outsideNote":
    "Outside NL and BE, fixed shipping costs apply (no free shipping).",
  "checkout.field.firstName": "First name",
  "checkout.field.lastName": "Last name",
  "checkout.field.postalCode": "Postcode",
  "checkout.field.houseNumber": "No.",
  "checkout.field.addition": "Addition",
  "checkout.field.street": "Street",
  "checkout.field.streetLookup": "Street (looking up address…)",
  "checkout.field.autofill": "Filled in automatically",
  "checkout.field.city": "City",
  "checkout.field.phone": "Phone (optional)",
  "checkout.billing.toggle": "Billing address differs from the delivery address",
  "checkout.billing.companyOptional": "Company name (optional)",
  "checkout.billing.streetAndNumber": "Street and house number",
  "checkout.billing.streetPlaceholder": "Street name 1",

  "checkout.delivery.title": "Delivery",

  "checkout.summary.title": "Your order",
  "checkout.billieSurcharge": "Billie surcharge",
  "checkout.terms.pre": "I agree to the ",
  "checkout.terms.termsLink": "terms & conditions",
  "checkout.terms.mid": " and the ",
  "checkout.terms.privacyLink": "privacy policy",
  "checkout.terms.post": ".",
  "checkout.newsletter":
    "Keep me posted on DIY tips and KLUSRPAS offers (newsletter).",
  "checkout.pay": "Pay {amount}",
  "checkout.chooseBankHint": "Choose your bank to continue.",
  "checkout.choosePaymentHint": "Please choose a payment method first.",
  "checkout.usp.freeReturn": "Free returns",
  "checkout.usp.fastDelivery": "Fast delivery",

  "checkout.error.choosePayment": "Please choose a payment method first.",
  "checkout.error.chooseBank": "Please choose your bank for iDEAL first.",
  "checkout.error.accountPassword":
    "Choose a password of at least 8 characters for your account.",
  "checkout.error.card": "Please check your card details and try again.",
  "checkout.error.paymentFailed": "Failed to create payment",
  "checkout.error.generic": "Something went wrong",

  "checkout.payment.chooseBank": "Choose your bank",
  "checkout.payment.hint.ideal": "Pay directly with your own bank",
  "checkout.payment.hint.creditcard": "Visa, Mastercard",
  "checkout.payment.hint.klarna": "Pay later — within 14 days",
  "checkout.payment.hint.bancontact": "Pay with your Bancontact card",

  "checkout.reorder.title": "Forgotten something?",
  "checkout.reorder.textPre": "Order something else within ",
  "checkout.reorder.textMinutes": "15 minutes",
  "checkout.reorder.textMid": " and pay ",
  "checkout.reorder.textBold": "no extra shipping costs",
  "checkout.reorder.textPost": " — we'll send it in a single parcel.",
  "checkout.reorder.added": "Added — no extra shipping costs",
  "checkout.reorder.addAria": "Add {title}",
  "checkout.reorder.toCart": "Go to cart",
  "checkout.reorder.continueShopping": "Continue shopping",

  "checkout.thanks.title": "Thank you for your order!",
  "checkout.thanks.text":
    "We've received your order and we'll get started on it right away.",
  "checkout.thanks.confirmationSentPre": " A confirmation has been sent to ",
  "checkout.thanks.confirmationSentPost": ".",
  "checkout.thanks.orderNumber": "Order number",
  "checkout.thanks.orderDate": "Order date",
  "checkout.thanks.subtotal": "Subtotal",
  "checkout.thanks.shipping": "Shipping",
  "checkout.thanks.totalPaid": "Total paid",
  "checkout.thanks.free": "Free",
  "checkout.thanks.expectedDelivery": "Expected delivery: {date}",
  "checkout.thanks.step.confirmation.title": "Confirmation",
  "checkout.thanks.step.confirmation.hint": "Check your inbox",
  "checkout.thanks.step.packing.title": "Being packed",
  "checkout.thanks.step.packing.hint": "Today still",
  "checkout.thanks.step.onTheWay.title": "On its way",
  "checkout.thanks.step.onTheWay.hint": "Track your parcel",
  "checkout.thanks.trackOrder": "Track your order",
  "checkout.thanks.continueShopping": "Continue shopping",
  "checkout.thanks.downloadInvoice": "Download your invoice (PDF)",
  "checkout.thanks.deliveryAddress": "Delivery address",
  "checkout.thanks.loadError":
    "We couldn't load the order details, but your payment was received in good order. You'll receive a confirmation by email.",
  "checkout.thanks.backHome": "Back to home",
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

  "checkout.title": "Paiement",
  "checkout.backToCart": "Retour au panier",
  "checkout.empty.text": "Ajoutez d'abord des produits pour passer commande.",
  "checkout.empty.toRange": "Voir l'assortiment",

  "checkout.private": "Particulier",
  "checkout.business": "Professionnel (hors TVA)",

  "checkout.reorderFree":
    "Livraison gratuite — vous commandez dans les 15 minutes suivant votre commande précédente.",

  "checkout.loggedInPre": "Vous êtes connecté en tant que ",
  "checkout.loggedInPost": ". Votre commande sera associée à votre compte.",
  "checkout.guest.title": "Vous commandez en tant qu'invité — très rapide, aucun compte requis",
  "checkout.guest.text":
    "Saisissez vos coordonnées et commandez aussitôt. En bas, créez un compte en un clic pour votre historique de commandes.",
  "checkout.guest.haveAccount": "Vous avez déjà un compte ? Se connecter",
  "checkout.login.emailPlaceholder": "Adresse e-mail",
  "checkout.login.passwordPlaceholder": "Mot de passe",
  "checkout.login.submit": "Se connecter",
  "checkout.login.error": "Échec de la connexion. Vérifiez votre adresse e-mail et votre mot de passe.",
  "checkout.login.forgotPre": "Mot de passe oublié ou vous préférez un lien de connexion ? ",
  "checkout.login.forgotLink": "Aller à la connexion",

  "checkout.section.contact": "Coordonnées",
  "checkout.section.delivery": "Adresse de livraison",
  "checkout.section.shipping": "Mode de livraison",
  "checkout.section.payment": "Mode de paiement",

  "checkout.field.email": "Adresse e-mail",
  "checkout.field.emailPlaceholder": "vous@exemple.fr",
  "checkout.createAccount.labelBold": "Créez tout de suite un compte",
  "checkout.createAccount.labelRest": " — enregistrez vos données et consultez vos commandes plus tard. ",
  "checkout.createAccount.optional": "(facultatif)",
  "checkout.createAccount.passwordPlaceholder": "Choisissez un mot de passe (8 caractères min.)",
  "checkout.createAccount.passwordHint": "Au moins 8 caractères.",
  "checkout.field.company": "Nom de l'entreprise",
  "checkout.field.companyPlaceholder": "Entreprise SARL",
  "checkout.field.coc": "Numéro RCS (facultatif)",
  "checkout.field.vat": "Numéro de TVA (facultatif)",

  "checkout.field.country": "Pays",
  "checkout.country.outsideNote":
    "En dehors des NL et de la BE, des frais de livraison fixes s'appliquent (pas de livraison gratuite).",
  "checkout.field.firstName": "Prénom",
  "checkout.field.lastName": "Nom",
  "checkout.field.postalCode": "Code postal",
  "checkout.field.houseNumber": "N°",
  "checkout.field.addition": "Complément",
  "checkout.field.street": "Rue",
  "checkout.field.streetLookup": "Rue (recherche de l'adresse…)",
  "checkout.field.autofill": "Renseigné automatiquement",
  "checkout.field.city": "Ville",
  "checkout.field.phone": "Téléphone (facultatif)",
  "checkout.billing.toggle": "L'adresse de facturation diffère de l'adresse de livraison",
  "checkout.billing.companyOptional": "Nom de l'entreprise (facultatif)",
  "checkout.billing.streetAndNumber": "Rue et numéro",
  "checkout.billing.streetPlaceholder": "Nom de la rue 1",

  "checkout.delivery.title": "Livraison",

  "checkout.summary.title": "Votre commande",
  "checkout.billieSurcharge": "Supplément Billie",
  "checkout.terms.pre": "J'accepte les ",
  "checkout.terms.termsLink": "conditions générales",
  "checkout.terms.mid": " et la ",
  "checkout.terms.privacyLink": "politique de confidentialité",
  "checkout.terms.post": ".",
  "checkout.newsletter":
    "Tenez-moi informé des astuces bricolage et des offres KLUSRPAS (newsletter).",
  "checkout.pay": "Payer {amount}",
  "checkout.chooseBankHint": "Choisissez votre banque pour continuer.",
  "checkout.choosePaymentHint": "Veuillez d'abord choisir un mode de paiement.",
  "checkout.usp.freeReturn": "Retour gratuit",
  "checkout.usp.fastDelivery": "Livraison rapide",

  "checkout.error.choosePayment": "Veuillez d'abord choisir un mode de paiement.",
  "checkout.error.chooseBank": "Veuillez d'abord choisir votre banque pour iDEAL.",
  "checkout.error.accountPassword":
    "Choisissez un mot de passe d'au moins 8 caractères pour votre compte.",
  "checkout.error.card": "Vérifiez vos données de carte et réessayez.",
  "checkout.error.paymentFailed": "Échec de la création du paiement",
  "checkout.error.generic": "Une erreur s'est produite",

  "checkout.payment.chooseBank": "Choisissez votre banque",
  "checkout.payment.hint.ideal": "Payez directement avec votre propre banque",
  "checkout.payment.hint.creditcard": "Visa, Mastercard",
  "checkout.payment.hint.klarna": "Paiement différé — sous 14 jours",
  "checkout.payment.hint.bancontact": "Payez avec votre carte Bancontact",

  "checkout.reorder.title": "Vous avez oublié quelque chose ?",
  "checkout.reorder.textPre": "Commandez autre chose dans les ",
  "checkout.reorder.textMinutes": "15 minutes",
  "checkout.reorder.textMid": " et ne payez ",
  "checkout.reorder.textBold": "aucun frais de livraison supplémentaire",
  "checkout.reorder.textPost": " — nous l'envoyons dans un seul colis.",
  "checkout.reorder.added": "Ajouté — aucun frais de livraison supplémentaire",
  "checkout.reorder.addAria": "Ajouter {title}",
  "checkout.reorder.toCart": "Voir le panier",
  "checkout.reorder.continueShopping": "Continuer mes achats",

  "checkout.thanks.title": "Merci pour votre commande !",
  "checkout.thanks.text":
    "Nous avons bien reçu votre commande et nous nous y mettons tout de suite.",
  "checkout.thanks.confirmationSentPre": " Une confirmation a été envoyée à ",
  "checkout.thanks.confirmationSentPost": ".",
  "checkout.thanks.orderNumber": "Numéro de commande",
  "checkout.thanks.orderDate": "Date de commande",
  "checkout.thanks.subtotal": "Sous-total",
  "checkout.thanks.shipping": "Frais de livraison",
  "checkout.thanks.totalPaid": "Total payé",
  "checkout.thanks.free": "Gratuit",
  "checkout.thanks.expectedDelivery": "Livraison estimée : {date}",
  "checkout.thanks.step.confirmation.title": "Confirmation",
  "checkout.thanks.step.confirmation.hint": "Vérifiez votre boîte de réception",
  "checkout.thanks.step.packing.title": "En préparation",
  "checkout.thanks.step.packing.hint": "Aujourd'hui même",
  "checkout.thanks.step.onTheWay.title": "En route",
  "checkout.thanks.step.onTheWay.hint": "Suivez votre colis",
  "checkout.thanks.trackOrder": "Suivre votre commande",
  "checkout.thanks.continueShopping": "Continuer mes achats",
  "checkout.thanks.downloadInvoice": "Télécharger votre facture (PDF)",
  "checkout.thanks.deliveryAddress": "Adresse de livraison",
  "checkout.thanks.loadError":
    "Nous n'avons pas pu charger les détails de la commande, mais votre paiement a bien été reçu. Vous recevrez une confirmation par e-mail.",
  "checkout.thanks.backHome": "Retour à l'accueil",
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

  "checkout.title": "Kasse",
  "checkout.backToCart": "Zurück zum Warenkorb",
  "checkout.empty.text": "Fügen Sie zuerst Produkte hinzu, um zur Kasse zu gehen.",
  "checkout.empty.toRange": "Zum Sortiment",

  "checkout.private": "Privat",
  "checkout.business": "Geschäftlich (zzgl. MwSt.)",

  "checkout.reorderFree":
    "Kostenloser Versand — Sie bestellen innerhalb von 15 Minuten nach Ihrer vorherigen Bestellung.",

  "checkout.loggedInPre": "Sie sind angemeldet als ",
  "checkout.loggedInPost": ". Ihre Bestellung wird mit Ihrem Konto verknüpft.",
  "checkout.guest.title": "Sie bestellen als Gast — superschnell, kein Konto erforderlich",
  "checkout.guest.text":
    "Geben Sie Ihre Daten ein und bestellen Sie direkt. Unten erstellen Sie mit einem Häkchen ein Konto für Ihre Bestellhistorie.",
  "checkout.guest.haveAccount": "Haben Sie bereits ein Konto? Anmelden",
  "checkout.login.emailPlaceholder": "E-Mail-Adresse",
  "checkout.login.passwordPlaceholder": "Passwort",
  "checkout.login.submit": "Anmelden",
  "checkout.login.error": "Anmeldung fehlgeschlagen. Bitte prüfen Sie Ihre E-Mail-Adresse und Ihr Passwort.",
  "checkout.login.forgotPre": "Passwort vergessen oder lieber einen Login-Link? ",
  "checkout.login.forgotLink": "Zur Anmeldung",

  "checkout.section.contact": "Kontaktdaten",
  "checkout.section.delivery": "Lieferadresse",
  "checkout.section.shipping": "Versandart",
  "checkout.section.payment": "Zahlungsart",

  "checkout.field.email": "E-Mail-Adresse",
  "checkout.field.emailPlaceholder": "sie@beispiel.de",
  "checkout.createAccount.labelBold": "Erstellen Sie direkt ein Konto",
  "checkout.createAccount.labelRest": " — speichern Sie Ihre Daten und sehen Sie Ihre Bestellungen später ein. ",
  "checkout.createAccount.optional": "(optional)",
  "checkout.createAccount.passwordPlaceholder": "Wählen Sie ein Passwort (mind. 8 Zeichen)",
  "checkout.createAccount.passwordHint": "Mindestens 8 Zeichen.",
  "checkout.field.company": "Firmenname",
  "checkout.field.companyPlaceholder": "Firma GmbH",
  "checkout.field.coc": "Handelsregisternummer (optional)",
  "checkout.field.vat": "USt-IdNr. (optional)",

  "checkout.field.country": "Land",
  "checkout.country.outsideNote":
    "Außerhalb von NL und BE gelten feste Versandkosten (kein kostenloser Versand).",
  "checkout.field.firstName": "Vorname",
  "checkout.field.lastName": "Nachname",
  "checkout.field.postalCode": "Postleitzahl",
  "checkout.field.houseNumber": "Nr.",
  "checkout.field.addition": "Zusatz",
  "checkout.field.street": "Straße",
  "checkout.field.streetLookup": "Straße (Adresse wird abgerufen…)",
  "checkout.field.autofill": "Wird automatisch ausgefüllt",
  "checkout.field.city": "Ort",
  "checkout.field.phone": "Telefon (optional)",
  "checkout.billing.toggle": "Rechnungsadresse weicht von der Lieferadresse ab",
  "checkout.billing.companyOptional": "Firmenname (optional)",
  "checkout.billing.streetAndNumber": "Straße und Hausnummer",
  "checkout.billing.streetPlaceholder": "Straßenname 1",

  "checkout.delivery.title": "Liefern",

  "checkout.summary.title": "Ihre Bestellung",
  "checkout.billieSurcharge": "Billie-Zuschlag",
  "checkout.terms.pre": "Ich stimme den ",
  "checkout.terms.termsLink": "Allgemeinen Geschäftsbedingungen",
  "checkout.terms.mid": " und der ",
  "checkout.terms.privacyLink": "Datenschutzerklärung",
  "checkout.terms.post": " zu.",
  "checkout.newsletter":
    "Halten Sie mich über Heimwerker-Tipps und KLUSRPAS-Angebote auf dem Laufenden (Newsletter).",
  "checkout.pay": "Bezahlen {amount}",
  "checkout.chooseBankHint": "Wählen Sie Ihre Bank, um fortzufahren.",
  "checkout.choosePaymentHint": "Bitte wählen Sie zuerst eine Zahlungsart.",
  "checkout.usp.freeReturn": "Kostenlose Rückgabe",
  "checkout.usp.fastDelivery": "Schnelle Lieferung",

  "checkout.error.choosePayment": "Bitte wählen Sie zuerst eine Zahlungsart.",
  "checkout.error.chooseBank": "Bitte wählen Sie zuerst Ihre Bank für iDEAL.",
  "checkout.error.accountPassword":
    "Wählen Sie ein Passwort mit mindestens 8 Zeichen für Ihr Konto.",
  "checkout.error.card": "Bitte prüfen Sie Ihre Kartendaten und versuchen Sie es erneut.",
  "checkout.error.paymentFailed": "Zahlung konnte nicht erstellt werden",
  "checkout.error.generic": "Etwas ist schiefgelaufen",

  "checkout.payment.chooseBank": "Wählen Sie Ihre Bank",
  "checkout.payment.hint.ideal": "Zahlen Sie direkt mit Ihrer eigenen Bank",
  "checkout.payment.hint.creditcard": "Visa, Mastercard",
  "checkout.payment.hint.klarna": "Später bezahlen — innerhalb von 14 Tagen",
  "checkout.payment.hint.bancontact": "Zahlen Sie mit Ihrer Bancontact-Karte",

  "checkout.reorder.title": "Etwas vergessen?",
  "checkout.reorder.textPre": "Bestellen Sie innerhalb von ",
  "checkout.reorder.textMinutes": "15 Minuten",
  "checkout.reorder.textMid": " noch etwas und zahlen Sie ",
  "checkout.reorder.textBold": "keine zusätzlichen Versandkosten",
  "checkout.reorder.textPost": " — wir versenden alles in einem Paket.",
  "checkout.reorder.added": "Hinzugefügt — keine zusätzlichen Versandkosten",
  "checkout.reorder.addAria": "{title} hinzufügen",
  "checkout.reorder.toCart": "Zum Warenkorb",
  "checkout.reorder.continueShopping": "Weiter einkaufen",

  "checkout.thanks.title": "Vielen Dank für Ihre Bestellung!",
  "checkout.thanks.text":
    "Wir haben Ihre Bestellung erhalten und kümmern uns sofort darum.",
  "checkout.thanks.confirmationSentPre": " Eine Bestätigung wurde gesendet an ",
  "checkout.thanks.confirmationSentPost": ".",
  "checkout.thanks.orderNumber": "Bestellnummer",
  "checkout.thanks.orderDate": "Bestelldatum",
  "checkout.thanks.subtotal": "Zwischensumme",
  "checkout.thanks.shipping": "Versandkosten",
  "checkout.thanks.totalPaid": "Gesamt bezahlt",
  "checkout.thanks.free": "Kostenlos",
  "checkout.thanks.expectedDelivery": "Voraussichtliche Lieferung: {date}",
  "checkout.thanks.step.confirmation.title": "Bestätigung",
  "checkout.thanks.step.confirmation.hint": "Prüfen Sie Ihren Posteingang",
  "checkout.thanks.step.packing.title": "Wird verpackt",
  "checkout.thanks.step.packing.hint": "Noch heute",
  "checkout.thanks.step.onTheWay.title": "Unterwegs",
  "checkout.thanks.step.onTheWay.hint": "Verfolgen Sie Ihr Paket",
  "checkout.thanks.trackOrder": "Bestellung verfolgen",
  "checkout.thanks.continueShopping": "Weiter einkaufen",
  "checkout.thanks.downloadInvoice": "Rechnung herunterladen (PDF)",
  "checkout.thanks.deliveryAddress": "Lieferadresse",
  "checkout.thanks.loadError":
    "Wir konnten die Bestelldaten nicht laden, aber Ihre Zahlung ist ordnungsgemäß eingegangen. Sie erhalten eine Bestätigung per E-Mail.",
  "checkout.thanks.backHome": "Zurück zur Startseite",
};

export const dictionaries: Record<Locale, Messages> = { nl, en, fr, de };

export type MessageKey = keyof Messages;
