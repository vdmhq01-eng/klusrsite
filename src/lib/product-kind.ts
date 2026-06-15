import type { Product } from "@/types";

const VERF_KIND: Record<string, string> = {
  lak: "Lakverf",
  binnenverf: "Muurverf",
  buitenverf: "Buitenverf",
  beits: "Beits",
  primer: "Grondverf",
  houtolie: "Houtolie",
};

/** Korte, leesbare productsoort onder de titel (Lakverf, Lamp, Batterijen …). */
export function productKindLabel(p: Product): string {
  const t = p.title.toLowerCase();
  if (/\bbatterij/.test(t)) return "Batterijen";

  switch (p.category) {
    case "verf":
      return VERF_KIND[p.subCategory ?? ""] ?? "Verf";
    case "verlichting":
      return /lamp|peer|led|spot|\btl\b|buis|armatuur/.test(t) ? "Lamp" : "Verlichting";
    case "elektra":
      return "Elektra";
    case "ijzerwaren":
      if (/schroef|schroeven|\bbout\b/.test(t)) return "Schroeven";
      if (/\bplug/.test(t)) return "Pluggen";
      if (/scharnier|beslag|\bslot\b|sluitwerk/.test(t)) return "Beslag & sloten";
      return "Bevestiging";
    case "gereedschap":
      if (/kwast/.test(t)) return "Kwast";
      if (/roller|verfrol/.test(t)) return "Roller";
      if (/schuur/.test(t)) return "Schuurmateriaal";
      if (/tape|afplak/.test(t)) return "Afplaktape";
      if (/contactspray|kruipolie|slotspray|siliconen|smeer/.test(t)) return "Onderhoud";
      return "Gereedschap";
    case "afbouw-fijnbouw":
      if (/behang/.test(t)) return "Behang";
      if (/lijm|\bkit\b|vulmiddel|plamuur|purschuim/.test(t)) return "Lijm & kit";
      if (/hor\b|horren/.test(t)) return "Horren";
      return "Afbouw";
    case "tuin":
      return "Tuin & buiten";
    case "vloeren-raam":
      return "Vloeren";
    default:
      return "Product";
  }
}
