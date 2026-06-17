/**
 * KLUSR-logo's renderen als PNG voor Google-componenten
 * (Google Ads asset-bibliotheek, Merchant Center, Bedrijfsprofiel).
 *
 * Matcht het merk uit src/components/layout/logo.tsx:
 *   "KLUS" in #101010  +  "R" wit op een rode (#C90000) afgeronde tegel.
 *
 * Levert (in /public/brand):
 *   - vierkant 1:1 (1200×1200)  wit / transparant / zwart
 *   - liggend  4:1 (1200×300)   wit / transparant
 *
 * Herrenderen:  npm i -D @napi-rs/canvas  &&  node scripts/build-logos.mjs
 * (De PNG's worden gecommit, dus de build heeft @napi-rs/canvas niet nodig.)
 */
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "brand");
mkdirSync(OUT, { recursive: true });

const FONT = "KLUSRBold";
GlobalFonts.registerFromPath(
  "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
  FONT,
);

const RED = "#C90000";
const BLACK = "#101010";
const WHITE = "#ffffff";

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Totale breedte/hoogte van het wordmark bij een gegeven fontgrootte. */
function metrics(ctx, fontSize) {
  ctx.font = `${fontSize}px ${FONT}`;
  const wKlus = ctx.measureText("KLUS").width;
  const tile = fontSize * 1.22; // afgeronde tegel om de R (ietsje groter dan caps)
  const gap = fontSize * 0.05;
  return { wKlus, tile, gap, total: wKlus + gap + tile };
}

/** Teken het wordmark gecentreerd in (W×H). `light`=tekst donker (voor wit/transp). */
function drawWordmark(ctx, W, H, { light }) {
  // Kies fontgrootte: pas op breedte, begrens op hoogte.
  const targetW = W * 0.74;
  const m0 = metrics(ctx, 100);
  let fontSize = (100 * targetW) / m0.total;
  let m = metrics(ctx, fontSize);
  const maxTile = H * 0.74;
  if (m.tile > maxTile) {
    fontSize = (fontSize * maxTile) / m.tile;
    m = metrics(ctx, fontSize);
  }

  const cx = W / 2;
  const cy = H / 2;
  const startX = cx - m.total / 2;
  const optical = fontSize * 0.04; // arial zit optisch iets laag bij "middle"

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = `${fontSize}px ${FONT}`;

  // "KLUS"
  ctx.fillStyle = light ? BLACK : WHITE;
  ctx.fillText("KLUS", startX, cy - optical);

  // Rode tegel + witte "R"
  const tileX = startX + m.wKlus + m.gap;
  const tileY = cy - m.tile / 2;
  ctx.fillStyle = RED;
  roundRect(ctx, tileX, tileY, m.tile, m.tile, m.tile * 0.17);
  ctx.fill();

  ctx.fillStyle = WHITE;
  ctx.textAlign = "center";
  ctx.fillText("R", tileX + m.tile / 2, cy - optical);
}

function render(name, W, H, { bg, light }) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  if (bg) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
  }
  drawWordmark(ctx, W, H, { light });
  const file = join(OUT, name);
  writeFileSync(file, canvas.toBuffer("image/png"));
  console.log("✓", name, `${W}×${H}`);
  return file;
}

// 1:1 vierkant (Google Ads 1:1 logo, Merchant Center, Bedrijfsprofiel)
render("klusr-logo-vierkant-wit-1200.png", 1200, 1200, { bg: WHITE, light: true });
render("klusr-logo-vierkant-transparant-1200.png", 1200, 1200, { bg: null, light: true });
render("klusr-logo-vierkant-zwart-1200.png", 1200, 1200, { bg: BLACK, light: false });

// 4:1 liggend (Google Ads landscape logo)
render("klusr-logo-liggend-wit-1200x300.png", 1200, 300, { bg: WHITE, light: true });
render("klusr-logo-liggend-transparant-1200x300.png", 1200, 300, { bg: null, light: true });

console.log("\nKlaar — /public/brand");
