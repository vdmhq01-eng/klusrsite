/**
 * Pre-build catalogus-sync.
 *
 * Ververst vóór `next build` de productcatalogus (productdata + voorraad) uit
 * CHANNABLE — de primaire bron. Channable haalt zelf de data uit Tilroy.
 *
 * Veilig by design: lukt de sync niet (geen credentials, geen CHANNABLE_PROJECT_ID,
 * netwerk/-API-fout), dan behouden we de reeds gecommitte snapshot en gaat de
 * build gewoon door. Een feed-sync mag de deploy nooit breken.
 *
 * Activeren in productie: zet CHANNABLE_TOKEN, CHANNABLE_COMPANY_ID en
 * CHANNABLE_PROJECT_ID (of CHANNABLE_ITEMS_URL) in de Vercel-env. Zonder die
 * vars draait de webshop door op de laatste gecommitte snapshot.
 */

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const configured =
  process.env.CHANNABLE_TOKEN &&
  process.env.CHANNABLE_COMPANY_ID &&
  (process.env.CHANNABLE_PROJECT_ID || process.env.CHANNABLE_ITEMS_URL);

if (!configured) {
  console.log(
    "ℹ Channable niet geconfigureerd (CHANNABLE_TOKEN / CHANNABLE_COMPANY_ID / " +
      "CHANNABLE_PROJECT_ID) — build gebruikt de bestaande catalogus-snapshot.",
  );
  process.exit(0);
}

console.log("→ Catalogus verversen uit Channable (productdata + voorraad)…");
const res = spawnSync(
  process.execPath,
  [join(__dirname, "build-channable-catalog.mjs")],
  { stdio: "inherit" },
);

if (res.status !== 0) {
  console.warn(
    "⚠ Channable-sync mislukt — build gaat verder met de bestaande snapshot " +
      "(geen onderbreking van de deploy).",
  );
}

// Nooit de build breken op een feed-sync: altijd succesvol afsluiten.
process.exit(0);
