/**
 * Pre-build catalogus-sync.
 *
 * Ververst vóór `next build` de catalogus uit de CHANNABLE Google-feed (XML),
 * inclusief de channableusercontent-afbeeldingen. Standaard-feed-URL staat in
 * build-channable-feed.mjs; overschrijfbaar via CHANNABLE_FEED_URL.
 *
 * Veilig by design: lukt de sync niet (netwerk, lege/ongezonde feed), dan
 * behoudt build-channable-feed.mjs de reeds gecommitte snapshot en gaat de
 * build gewoon door. Een feed-sync mag de deploy nooit breken.
 */

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log("→ Catalogus verversen uit de Channable-feed…");
const res = spawnSync(
  process.execPath,
  [join(__dirname, "build-channable-feed.mjs")],
  { stdio: "inherit" },
);

if (res.status !== 0) {
  console.warn(
    "⚠ Feed-sync mislukt of feed ongezond — build gaat verder met de bestaande " +
      "snapshot (geen onderbreking van de deploy).",
  );
}

// Nooit de build breken op een feed-sync: altijd succesvol afsluiten.
process.exit(0);
