/**
 * Scanbare Code 128 (subset B) streepjescode als inline SVG — pure functie, geen
 * dependency, betrouwbaar in print. Codeert GTIN's én alfanumerieke SKU's, zodat
 * de magazijnmedewerker elke pakbonregel kan scannen.
 */

// Canonieke Code 128-patronen (module-breedtes bar/space). Index 0..102 = data,
// 104 = Start B, 106 = Stop. Som = 11 modules per teken (Stop = 13).
const PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112",
];

const START_B = 104;
const STOP = 106;

/** Bouw de Code 128B-codes (start + data + checksum + stop) voor een waarde. */
function encode(value: string): number[] {
  const clean = (value || "").replace(/[^\x20-\x7E]/g, "").slice(0, 40) || "0";
  const codes = [START_B];
  let sum = START_B;
  for (let i = 0; i < clean.length; i++) {
    const v = clean.charCodeAt(i) - 32;
    codes.push(v);
    sum += v * (i + 1);
  }
  codes.push(sum % 103);
  codes.push(STOP);
  return codes;
}

export function Barcode({
  value,
  height = 38,
  module = 1.1,
}: {
  value: string;
  height?: number;
  module?: number;
}) {
  const codes = encode(value);
  const quiet = 10; // verplichte stille zone links/rechts (modules)
  const bars: { x: number; w: number }[] = [];
  let x = quiet;
  for (const code of codes) {
    const pattern = PATTERNS[code] ?? PATTERNS[0];
    let isBar = true;
    for (const ch of pattern) {
      const w = Number(ch);
      if (isBar) bars.push({ x, w });
      x += w;
      isBar = !isBar;
    }
  }
  const totalModules = x + quiet;
  const width = totalModules * module;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${totalModules} ${height}`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      role="img"
      aria-label={`Barcode ${value}`}
    >
      <rect width={totalModules} height={height} fill="#fff" />
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={height} fill="#000" />
      ))}
    </svg>
  );
}
