/**
 * Genereert Google Ads Editor-importeerbare CSV's voor KLUSR (NL Search).
 *
 * Output (marketing/google-ads/):
 *   - klusr-search-campaigns.csv   → één gecombineerd importbestand
 *     (campagnes, advertentiegroepen, zoekwoorden, responsieve zoekadvertenties)
 *   - negative-keywords.csv        → campagne-uitsluitingszoekwoorden
 *
 * Alles wordt gevalideerd op Google-limieten (kop ≤30, beschrijving ≤90,
 * pad ≤15) zodat de import nooit op tekenlengte afketst.
 *
 *   node scripts/gen-google-ads.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "marketing", "google-ads");
const SITE = "https://www.klusr.nl";

const DAILY_BUDGET = "15.00"; // placeholder — pas aan naar eigen budget
const MAX_CPC = "0.60"; // placeholder — pas aan naar eigen bod

// --- Gedeelde advertentie-assets (hergebruikt over advertentiegroepen) -------
const GENERIC_HEADLINES = [
  "Verf Kopen bij KLUSR",
  "Voor 19u, Morgen in Huis",
  "Verf op Kleur Gemengd",
  "Advies van Ex-Schilders",
  "Gratis Retour, 30 Dagen",
  "Profiteer van KLUSRPAS",
  "Scherpe Verfprijzen",
  "Bestel Verf Online",
  "Betaal Veilig Achteraf",
];

const GENERIC_DESCRIPTIONS = [
  "Bestel verf online bij KLUSR. Voor 19:00 besteld, morgen in huis. Op kleur gemengd.",
  "Advies van ex-schilders, scherpe prijzen en gratis retour binnen 30 dagen.",
  "Kies uit topmerken en duizenden kleuren. Wij mengen je verf exact op jouw kleur.",
  "Profiteer van KLUSRPAS-voordeel en betaal veilig achteraf. Bestel vandaag bij KLUSR.",
];

const url = (path) => `${SITE}${path}`;

// term → { phrase, exact } regels in de keyword-uitvoer.
const kw = (terms) => terms;

// --- Campagnestructuur -------------------------------------------------------
const campaigns = [
  {
    name: "KLUSR | Search | Verf — Generiek",
    adGroups: [
      {
        name: "Muurverf",
        finalUrl: url("/categorie/verf/binnenmuurverf"),
        path1: "Verf",
        path2: "Muurverf",
        headlines: ["Muurverf op Voorraad", "Muurverf in Elke Kleur", "Dekt Vaak in 1 Laag"],
        keywords: kw(["muurverf", "muurverf kopen", "muurverf online", "muurverf bestellen", "witte muurverf", "muurverf op kleur"]),
      },
      {
        name: "Binnenmuurverf",
        finalUrl: url("/categorie/verf/binnenmuurverf"),
        path1: "Verf",
        path2: "Binnenmuurverf",
        headlines: ["Binnenmuurverf Online", "Muurverf voor Binnen", "Mat of Zijdeglans"],
        keywords: kw(["binnenmuurverf", "binnenmuurverf kopen", "muurverf binnen", "latex binnen"]),
      },
      {
        name: "Buitenmuurverf",
        finalUrl: url("/categorie/verf/buitenmuurverf"),
        path1: "Verf",
        path2: "Buitenmuurverf",
        headlines: ["Buitenmuurverf Online", "Gevelverf op Voorraad", "Weerbestendige Verf"],
        keywords: kw(["buitenmuurverf", "gevelverf", "buitenmuurverf kopen", "muurverf buiten"]),
      },
      {
        name: "Plafondverf",
        finalUrl: url("/categorie/verf/plafondverf"),
        path1: "Verf",
        path2: "Plafondverf",
        headlines: ["Plafondverf Online", "Strak Mat Plafond", "Witte Plafondverf"],
        keywords: kw(["plafondverf", "plafondverf kopen", "witte plafondverf", "plafond verven verf"]),
      },
    ],
  },
  {
    name: "KLUSR | Search | Lak & Beits",
    adGroups: [
      {
        name: "Lak",
        finalUrl: url("/categorie/verf/binnenlak"),
        path1: "Verf",
        path2: "Lak",
        headlines: ["Lak voor Hout", "Kozijn- en Deurlak", "Zijdeglans & Hoogglans"],
        keywords: kw(["lakverf", "houtlak", "lak voor hout", "kozijnlak", "deurlak", "watergedragen lak"]),
      },
      {
        name: "Beits",
        finalUrl: url("/categorie/verf/transparante-beits"),
        path1: "Verf",
        path2: "Beits",
        headlines: ["Beits voor Houtwerk", "Transparant of Dekkend", "Beits op Voorraad"],
        keywords: kw(["beits", "houtbeits", "transparante beits", "dekkende beits", "tuinhout beits"]),
      },
      {
        name: "Grondverf & Primer",
        finalUrl: url("/categorie/verf/grondverf-hout"),
        path1: "Verf",
        path2: "Grondverf",
        headlines: ["Grondverf & Primer", "Hecht op Elke Ondergrond", "Primer voor Hout"],
        keywords: kw(["grondverf", "primer verf", "hechtprimer", "grondverf hout", "grondverf metaal", "multiprimer"]),
      },
    ],
  },
  {
    name: "KLUSR | Search | Vloer & Beton",
    adGroups: [
      {
        name: "Vloerverf",
        finalUrl: url("/categorie/verf/vloerverf"),
        path1: "Vloerverf",
        path2: "Online",
        headlines: ["Vloerverf Online", "Slijtvaste Vloerverf", "Voor Beton en Hout"],
        keywords: kw(["vloerverf", "vloerverf kopen", "vloercoating", "vloerverf beton"]),
      },
      {
        name: "Betonverf",
        finalUrl: url("/categorie/verf/betonverf"),
        path1: "Verf",
        path2: "Beton",
        headlines: ["Betonverf Online", "Sterk op Beton", "Binnen en Buiten"],
        keywords: kw(["betonverf", "beton verf", "betonverf buiten", "betonvloer verf"]),
      },
      {
        name: "Garageverf",
        finalUrl: url("/categorie/verf/garageverf"),
        path1: "Verf",
        path2: "Garage",
        headlines: ["Garagevloerverf", "Bestand Tegen Banden", "Sterke Garageverf"],
        keywords: kw(["garageverf", "garagevloerverf", "garagevloer verf", "vloerverf garage"]),
      },
      {
        name: "Trapverf",
        finalUrl: url("/categorie/verf/trapverf"),
        path1: "Verf",
        path2: "Trap",
        headlines: ["Trapverf Online", "Slijtvaste Trapverf", "Mooi en Sterk"],
        keywords: kw(["trapverf", "traplak", "trap verven verf", "trapverf kopen"]),
      },
    ],
  },
  {
    name: "KLUSR | Search | Merken",
    adGroups: [
      {
        name: "Sikkens",
        finalUrl: url("/categorie/verf"),
        path1: "Verf",
        path2: "Sikkens",
        headlines: ["Sikkens bij KLUSR", "Sikkens op Voorraad", "Profverf, Scherpe Prijs"],
        keywords: kw(["sikkens", "sikkens verf", "sikkens rubbol", "sikkens alpha", "sikkens lak"]),
      },
      {
        name: "Histor",
        finalUrl: url("/categorie/verf"),
        path1: "Verf",
        path2: "Histor",
        headlines: ["Histor bij KLUSR", "Histor op Voorraad", "Histor in Elke Kleur"],
        keywords: kw(["histor", "histor verf", "histor perfect", "histor muurverf"]),
      },
      {
        name: "Flexa",
        finalUrl: url("/categorie/verf"),
        path1: "Verf",
        path2: "Flexa",
        headlines: ["Flexa bij KLUSR", "Flexa op Voorraad", "Flexa in Elke Kleur"],
        keywords: kw(["flexa", "flexa verf", "flexa muurverf", "flexa lak"]),
      },
      {
        name: "Wijzonol",
        finalUrl: url("/categorie/verf"),
        path1: "Verf",
        path2: "Wijzonol",
        headlines: ["Wijzonol bij KLUSR", "Wijzonol op Voorraad", "Lak, Beits en Muurverf"],
        keywords: kw(["wijzonol", "wijzonol verf", "wijzonol lak", "wijzonol beits"]),
      },
    ],
  },
  {
    name: "KLUSR | Search | Kleurenkiezer & Mengverf",
    adGroups: [
      {
        name: "Verf op kleur mengen",
        finalUrl: url("/kleurenkiezer"),
        path1: "Kleurenkiezer",
        path2: "Op-Kleur",
        headlines: ["Verf op Kleur Mengen", "Elke Kleur Mogelijk", "Exact op Jouw Kleur"],
        keywords: kw(["verf op kleur laten mengen", "verf laten mengen", "verf mengen op kleur", "mengverf", "kleur verf mengen"]),
      },
      {
        name: "RAL kleuren",
        finalUrl: url("/kleurenkiezer"),
        path1: "Kleurenkiezer",
        path2: "RAL",
        headlines: ["Verf in RAL-Kleur", "Alle RAL-Kleuren", "RAL op Maat Gemengd"],
        keywords: kw(["ral kleuren verf", "ral verf", "verf in ral kleur", "ral kleur muurverf"]),
      },
    ],
  },
];

// Campagne-brede uitsluitingszoekwoorden (bespaart budget op niet-koopintentie).
const NEGATIVES = [
  "gratis", "vacature", "vacatures", "baan", "opleiding", "cursus", "diy uitleg",
  "hoe verf je", "zelf maken", "recept", "verwijderen", "afbijten", "afhalen gratis",
  "tweedehands", "marktplaats", "behang", "spuiten huren", "verfspuit huren",
  "schilder inhuren", "schilder gezocht", "ervaringen", "review", "wikipedia",
  "betekenis", "kleurcode zoeken",
];

// --- Validatie ---------------------------------------------------------------
const errors = [];
const checkLen = (label, value, max) => {
  if (value && value.length > max) errors.push(`${label} > ${max}: "${value}" (${value.length})`);
};

// --- CSV-helpers -------------------------------------------------------------
const esc = (v) => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const row = (obj, cols) => cols.map((c) => esc(obj[c])).join(",");

const HEAD_COLS = 10;
const DESC_COLS = 4;
const COLUMNS = [
  "Campaign",
  "Campaign Daily Budget",
  "Campaign Type",
  "Networks",
  "Bid Strategy Type",
  "Ad Group",
  "Max CPC",
  "Keyword",
  "Match Type",
  ...Array.from({ length: HEAD_COLS }, (_, i) => `Headline ${i + 1}`),
  ...Array.from({ length: DESC_COLS }, (_, i) => `Description ${i + 1}`),
  "Path 1",
  "Path 2",
  "Final URL",
  "Status",
];

const lines = [COLUMNS.join(",")];
let nCampaigns = 0,
  nAdGroups = 0,
  nKeywords = 0,
  nAds = 0;

for (const c of campaigns) {
  nCampaigns++;
  // Campagne-regel (op Paused gezet — zet zelf aan na review + conversietracking).
  lines.push(
    row(
      {
        Campaign: c.name,
        "Campaign Daily Budget": DAILY_BUDGET,
        "Campaign Type": "Search",
        Networks: "Google search",
        "Bid Strategy Type": "Manual CPC",
        Status: "Paused",
      },
      COLUMNS,
    ),
  );

  for (const ag of c.adGroups) {
    nAdGroups++;
    checkLen(`Path1 [${ag.name}]`, ag.path1, 15);
    checkLen(`Path2 [${ag.name}]`, ag.path2, 15);
    // Advertentiegroep-regel
    lines.push(
      row(
        { Campaign: c.name, "Ad Group": ag.name, "Max CPC": MAX_CPC, Status: "Enabled" },
        COLUMNS,
      ),
    );

    // Zoekwoorden — phrase + exact per term
    for (const term of ag.keywords) {
      for (const mt of ["Phrase", "Exact"]) {
        nKeywords++;
        lines.push(
          row(
            {
              Campaign: c.name,
              "Ad Group": ag.name,
              Keyword: term,
              "Match Type": mt,
              Status: "Enabled",
            },
            COLUMNS,
          ),
        );
      }
    }

    // Responsieve zoekadvertentie — AG-specifiek + generiek (max 10 koppen)
    const headlines = [...ag.headlines, ...GENERIC_HEADLINES].slice(0, HEAD_COLS);
    const descriptions = GENERIC_DESCRIPTIONS.slice(0, DESC_COLS);
    headlines.forEach((h, i) => checkLen(`Headline ${i + 1} [${ag.name}]`, h, 30));
    descriptions.forEach((d, i) => checkLen(`Description ${i + 1} [${ag.name}]`, d, 90));

    const adRow = {
      Campaign: c.name,
      "Ad Group": ag.name,
      "Path 1": ag.path1,
      "Path 2": ag.path2,
      "Final URL": ag.finalUrl,
      Status: "Enabled",
    };
    headlines.forEach((h, i) => (adRow[`Headline ${i + 1}`] = h));
    descriptions.forEach((d, i) => (adRow[`Description ${i + 1}`] = d));
    lines.push(row(adRow, COLUMNS));
    nAds++;
  }
}

// Negatives-bestand
const negCols = ["Campaign", "Negative Keyword", "Match Type"];
const negLines = [negCols.join(",")];
for (const c of campaigns) {
  for (const n of NEGATIVES) {
    negLines.push(row({ Campaign: c.name, "Negative Keyword": n, "Match Type": "Phrase" }, negCols));
  }
}

if (errors.length) {
  console.error("Validatiefouten (tekenlimiet):\n" + errors.join("\n"));
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "klusr-search-campaigns.csv"), lines.join("\n") + "\n", "utf8");
writeFileSync(join(OUT, "negative-keywords.csv"), negLines.join("\n") + "\n", "utf8");

console.log(
  `OK — ${nCampaigns} campagnes, ${nAdGroups} advertentiegroepen, ${nKeywords} zoekwoorden, ${nAds} RSA's.\n` +
    `Geschreven naar ${OUT}`,
);
