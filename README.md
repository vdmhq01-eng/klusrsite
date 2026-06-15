# KLUSR — Webshop

> **De beste VERF en alles wat je NÚ nodig hebt voor de klus.**

KLUSR is een nieuwe generatie verfspeciaalzaak + lichte bouwmarkt. Deze repo bevat
de volledige webshop: mobiel‑first, sterk conversiegericht en doordrenkt met AI‑hulp
(productadvies, content‑generatie en een klushulp‑chatbot).

Gebouwd met **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS** en
**shadcn/ui**.

---

## ✨ Functionaliteit

### Pagina's
- **Homepage** – hero, klushulp‑funnel, verfcategorieën, populaire producten, Kluspas, acties, inspiratie
- **Categorie‑ & subcategoriepagina's** – met filters, sortering en SEO‑teksten
- **Product listing (PLP)** – filters als bottom‑sheet op mobiel, sidebar op desktop
- **Productdetail (PDP)** – galerij, varianten, kleurkiezer, voorraad per winkel, tabs (omschrijving/specificaties/reviews/FAQ/verwerking), "vaak samen gekocht", alternatieven, recent bekeken, AI‑productadvies, sticky add‑to‑cart op mobiel
- **Winkelwagen** – gratis‑verzending progressbar, Kluspas‑voordeel, "vaak vergeten", upsell, bewaar voor later
- **Checkout** – one‑page, Mollie‑betaalmethoden, orderoverzicht, trust badges
- **Bedankt** – orderbevestiging + tracking
- **Klushulp AI** – funnel, stappenplannen per klus, ingebedde chat
- **Kleurkiezer** – losse pagina + popup op verfproducten (kleur opgeslagen op cart line item)
- **Advies/inspiratie** – artikelen + detail
- **Winkels** – Nijverdal (flagship), Emmen, Zutphen, Apeldoorn, Deventer
- **Kluspas, Account, Favorieten, Bestelstatus, Klantenservice**
- **AI‑beheer dashboard** (`/admin`) – ontbrekende content signaleren, AI‑suggesties genereren, goed-/afkeuren, bulk genereren, SEO & FAQ

### Integraties
| Integratie | Gebruik | Demo‑modus zonder key |
| --- | --- | --- |
| **Claude AI** (`@anthropic-ai/sdk`) | Productadvies, content‑generatie, klushulp‑chat | Heuristische fallback‑antwoorden |
| **Mollie** (`@mollie/api-client`) | Betalingen (iDEAL, Bancontact, Creditcard, Klarna) | Gesimuleerde betaling → bedanktpagina |
| **Mailchimp** (`@mailchimp/mailchimp_marketing`) | Nieuwsbrief, abandoned cart | No‑op (logt naar console) |
| **Google Tag Manager** | E‑commerce tracking | dataLayer werkt lokaal voor debugging |

> De webshop draait **volledig zonder secrets** in demo‑modus, zodat je direct kunt ontwikkelen.

### Conversie & marketing
Gratis‑verzending progressbar · Kluspasprijzen · schaarste ("Nog 4 op voorraad in
Nijverdal") · urgentie ("Voor 16:00 besteld, morgen in huis") · social proof
(reviews) · cross‑sell ("vaak samen gekocht") · upsell (voordeliger per liter) ·
exit‑intent popup (5% korting) · nieuwsbrief · recent bekeken · sticky add‑to‑cart ·
trust badges · bundels.

---

## 🚀 Aan de slag

```bash
npm install
cp .env.example .env.local   # optioneel — vul keys in voor live integraties
npm run dev                  # http://localhost:3000
```

### Scripts
- `npm run dev` – ontwikkelserver
- `npm run build` – productie‑build
- `npm run start` – productieserver
- `npm run lint` – ESLint
- `npm run typecheck` – TypeScript check

### Environment variables
Zie [`.env.example`](./.env.example). Alle keys zijn optioneel; ontbrekende keys
activeren de demo‑modus per integratie.

---

## 🎨 Design

| Token | Hex | Tailwind |
| --- | --- | --- |
| KLUSR rood | `#C90000` | `bg-primary` / `text-primary` |
| Donkerrood | `#990000` | `klusr-red-dark` |
| Zwart/donker | `#101010` | `klusr-black` |
| Achtergrond | `#F7F7F7` | `bg-background` |
| Cards | `#FFFFFF` | `bg-card` |
| Border | `#E5E5E5` | `border-border` |
| Voorraad groen | `#16A34A` | `klusr-stock` |
| Actiegeel | `#FFC400` | `klusr-action` |

Mobiel is leidend: het ontwerp schaalt van mobiel naar desktop, met een sticky
bottom‑bar (Home / Zoeken / Klushulp / Favorieten / Winkelwagen) op mobiel.

---

## 🏗️ Architectuur

```
src/
├─ app/                 # App Router pagina's + API routes
│  ├─ api/              # ai/chat, ai/product-advice, ai/generate-content,
│  │                    # checkout/create-payment, checkout/webhook, newsletter
│  ├─ categorie/ product/ winkelwagen/ checkout/ bedankt/ ...
├─ components/
│  ├─ ui/               # shadcn/ui primitives
│  ├─ layout/ home/ product/ cart/ checkout/ color/ ai/ content/ account/ admin/ plp/
├─ lib/
│  ├─ data/             # mock catalogus (producten, categorieën, winkels, kleuren, artikelen)
│  ├─ store/            # Zustand: cart, favorites, ui, orders
│  ├─ ai/               # Claude client (met fallback)
│  ├─ payments.ts mailchimp.ts tracking.ts utils.ts
└─ types/               # domeinmodellen (Product, Category, CartItem, Order, ...)
```

### Tracking
Eén centrale helper: `trackEvent(eventName, payload)` (`src/lib/tracking.ts`) pusht
GA4‑e‑commerce events naar de GTM `dataLayer` (`view_item`, `add_to_cart`,
`begin_checkout`, `purchase`, `color_selected`, `klusadvies_started`, enz.).

### Betaalflow
`POST /api/checkout/create-payment` maakt een order + Mollie‑betaling →
redirect naar Mollie (of bedanktpagina in demo) → `POST /api/checkout/webhook`
verwerkt de status. Orders worden in‑memory bewaard (vervang door een database
voor productie).

### AI‑governance
AI mag **alleen suggesties** doen. Gevoelige velden (prijs, voorraad,
betaalinformatie) worden nooit automatisch aangepast — content gaat via het
`/admin` dashboard eerst langs goedkeuring.

---

## 📦 Mock data
De catalogus (~30 producten, 9 categorieën, 5 winkels, kleurcollecties, artikelen)
staat in `src/lib/data`. Productafbeeldingen gebruiken `picsum.photos`
placeholder‑URL's.
