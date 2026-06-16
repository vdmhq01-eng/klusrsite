// @ts-nocheck
/**
 * Laadt de Tilroy feature-feed (rijke productattributen) als Map<sku-id, NL-features>.
 * 100% join op de Google-feed g:id. Leeg bij fout → bouw valt terug op heuristiek.
 */

const FEATURE_URL =
  process.env.FEATURE_FEED_URL ||
  "https://tilroy-pub-ver-prd.s3.eu-west-1.amazonaws.com/780/feed/featureFeed_780_8934.json";

function nlValue(f) {
  if (!f || !f.value) return undefined;
  const nl = f.value.descriptions_nl;
  if (nl && nl.length && nl.join("").trim()) return nl.filter(Boolean).join(", ");
  if (f.value.codes && f.value.codes.length) return f.value.codes.filter(Boolean).join(", ");
  return undefined;
}

export async function loadFeatures() {
  try {
    const res = await fetch(FEATURE_URL);
    if (!res.ok) throw new Error(`feature-feed ${res.status}`);
    const arr = await res.json();
    const byId = new Map();
    for (const it of arr) {
      const out = {};
      for (const [k, f] of Object.entries(it.features || {})) {
        const v = nlValue(f);
        if (v !== undefined) out[k] = v;
      }
      byId.set(String(it.id), out);
    }
    console.log(`  ${byId.size} feature-records geladen`);
    return byId;
  } catch (e) {
    console.warn("⚠ feature-feed niet geladen:", e.message);
    return new Map();
  }
}
