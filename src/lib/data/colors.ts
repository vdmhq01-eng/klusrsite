import type { SelectedColor } from "@/types";

export interface ColorCollection {
  id: string;
  name: string;
  colors: SelectedColor[];
}

/**
 * Curated colour collections for the KLUSR colour picker.
 * A pragmatic subset of RAL plus on-trend interior shades.
 */
export const colorCollections: ColorCollection[] = [
  {
    id: "populair-2026",
    name: "Populair 2026",
    colors: [
      // Wit blijft veruit de meest gekozen kleur — daarom bovenaan.
      { name: "Zuiver Wit", code: "RAL 9010", hex: "#F1ECE1", collection: "Populair 2026" },
      { name: "Gebroken Wit", code: "RAL 9001", hex: "#E9E0D2", collection: "Populair 2026" },
      { name: "Warm Crème", code: "PP-26-01", hex: "#EDE3D1", collection: "Populair 2026" },
      { name: "Greige", code: "PP-26-02", hex: "#CFC6B8", collection: "Populair 2026" },
      { name: "Mocha", code: "PP-26-03", hex: "#A0826D", collection: "Populair 2026" },
      { name: "Saliegroen", code: "PP-26-04", hex: "#A7B5A0", collection: "Populair 2026" },
      { name: "Olijfgroen", code: "PP-26-05", hex: "#7A7A52", collection: "Populair 2026" },
      { name: "Kleibruin", code: "PP-26-06", hex: "#B07458", collection: "Populair 2026" },
      { name: "Mistblauw", code: "PP-26-07", hex: "#8FA3AD", collection: "Populair 2026" },
      { name: "Oudroze", code: "PP-26-08", hex: "#D8B9AE", collection: "Populair 2026" },
      { name: "Diep Bosgroen", code: "PP-26-09", hex: "#2F4538", collection: "Populair 2026" },
      { name: "Warm Antraciet", code: "PP-26-10", hex: "#3A3A3C", collection: "Populair 2026" },
    ],
  },
  {
    id: "klusr-trends",
    name: "KLUSR Trendkleuren",
    colors: [
      { name: "Wolkenwit", code: "KL-001", hex: "#F4F1EC", collection: "KLUSR Trendkleuren" },
      { name: "Kalkgrijs", code: "KL-002", hex: "#D9D6CF", collection: "KLUSR Trendkleuren" },
      { name: "Saliegroen", code: "KL-003", hex: "#A7B5A0", collection: "KLUSR Trendkleuren" },
      { name: "Diep Petrol", code: "KL-004", hex: "#1F4E5F", collection: "KLUSR Trendkleuren" },
      { name: "Terracotta", code: "KL-005", hex: "#C16A4F", collection: "KLUSR Trendkleuren" },
      { name: "Oker Geel", code: "KL-006", hex: "#D9A441", collection: "KLUSR Trendkleuren" },
      { name: "Warm Antraciet", code: "KL-007", hex: "#3A3A3C", collection: "KLUSR Trendkleuren" },
      { name: "Klassiek Taupe", code: "KL-008", hex: "#8C8178", collection: "KLUSR Trendkleuren" },
    ],
  },
  {
    id: "ral-klassiek",
    name: "RAL Klassiek",
    colors: [
      { name: "Zuiver Wit", code: "RAL 9010", hex: "#F1ECE1", collection: "RAL Klassiek" },
      { name: "Verkeerswit", code: "RAL 9016", hex: "#F1F0EA", collection: "RAL Klassiek" },
      { name: "Lichtgrijs", code: "RAL 7035", hex: "#CBD0CC", collection: "RAL Klassiek" },
      { name: "Antracietgrijs", code: "RAL 7016", hex: "#383E42", collection: "RAL Klassiek" },
      { name: "Zwartgrijs", code: "RAL 7021", hex: "#2F3234", collection: "RAL Klassiek" },
      { name: "Gitzwart", code: "RAL 9005", hex: "#0A0A0A", collection: "RAL Klassiek" },
      { name: "Dennengroen", code: "RAL 6009", hex: "#27352A", collection: "RAL Klassiek" },
      { name: "Mosgroen", code: "RAL 6005", hex: "#2F4538", collection: "RAL Klassiek" },
      { name: "Staalblauw", code: "RAL 5011", hex: "#1A2B3C", collection: "RAL Klassiek" },
      { name: "Gentiaanblauw", code: "RAL 5010", hex: "#0E4C92", collection: "RAL Klassiek" },
      { name: "Wijnrood", code: "RAL 3005", hex: "#5E2129", collection: "RAL Klassiek" },
      { name: "Verkeersrood", code: "RAL 3020", hex: "#C1121C", collection: "RAL Klassiek" },
    ],
  },
  {
    id: "natuurtinten",
    name: "Natuurtinten",
    colors: [
      { name: "Zand", code: "NT-01", hex: "#D8C7A8", collection: "Natuurtinten" },
      { name: "Leem", code: "NT-02", hex: "#C9B59B", collection: "Natuurtinten" },
      { name: "Mistgrijs", code: "NT-03", hex: "#BEBCB4", collection: "Natuurtinten" },
      { name: "Olijf", code: "NT-04", hex: "#7A7A52", collection: "Natuurtinten" },
      { name: "Rookblauw", code: "NT-05", hex: "#8FA3AD", collection: "Natuurtinten" },
      { name: "Mosterd", code: "NT-06", hex: "#C99A2E", collection: "Natuurtinten" },
      { name: "Roestbruin", code: "NT-07", hex: "#8A4B2F", collection: "Natuurtinten" },
      { name: "Houtskool", code: "NT-08", hex: "#33312E", collection: "Natuurtinten" },
    ],
  },
];

export const allColors: SelectedColor[] = colorCollections.flatMap((c) => c.colors);

/** Meest gekozen kleuren van dit jaar (wit voorop) — voor de kleurkiezer. */
export const popularColors2026: ColorCollection = colorCollections[0];

export const defaultColor: SelectedColor = colorCollections[0].colors[0]; // Zuiver Wit

export function findColor(code: string): SelectedColor | undefined {
  return allColors.find((c) => c.code === code);
}

/** Simple readable-contrast helper for swatch labels. */
export function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  // Perceived luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}
