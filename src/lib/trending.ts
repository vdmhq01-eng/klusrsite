/**
 * Bepaalt automatisch een "trending" thema op basis van de datum: feestdagen
 * (Vaderdag/Moederdag/feestdagen), seizoen en maand. Volledig deterministisch,
 * geen externe API. (Weer-gebaseerd kan later met een weer-API erbij.)
 */

export interface TrendingTheme {
  /** Sleutel voor tracking/debug. */
  key: string;
  title: string;
  subtitle: string;
  categorySlug: string;
  href: string;
}

/** Dag-van-de-maand van de n-de zondag in een maand (month: 0-11). */
function nthSunday(year: number, month: number, n: number): number {
  const first = new Date(year, month, 1).getDay(); // 0 = zondag
  const firstSunday = 1 + ((7 - first) % 7);
  return firstSunday + (n - 1) * 7;
}

export function getTrendingTheme(now: Date = new Date()): TrendingTheme {
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-11
  const d = now.getDate();

  // Vaderdag (3e zondag juni) — vanaf ~2,5 week ervoor.
  if (m === 5) {
    const vaderdag = nthSunday(y, 5, 3);
    if (d <= vaderdag && vaderdag - d <= 18) {
      return {
        key: "vaderdag",
        title: "Cadeautips voor Vaderdag",
        subtitle: "Verras hem met goed gereedschap",
        categorySlug: "gereedschap",
        href: "/categorie/gereedschap",
      };
    }
  }

  // Moederdag (2e zondag mei).
  if (m === 4) {
    const moederdag = nthSunday(y, 4, 2);
    if (d <= moederdag && moederdag - d <= 16) {
      return {
        key: "moederdag",
        title: "Maak het mooi voor Moederdag",
        subtitle: "Een frisse kleur of nieuwe sfeer in huis",
        categorySlug: "verf",
        href: "/categorie/verf",
      };
    }
  }

  // Feestdagen (december).
  if (m === 11) {
    return {
      key: "feestdagen",
      title: "Klaar voor de feestdagen",
      subtitle: "Sfeerverlichting en de puntjes op de i in huis",
      categorySlug: "verlichting",
      href: "/categorie/verlichting",
    };
  }

  // Lente/zomer (apr–aug): buiten klussen.
  if (m >= 3 && m <= 7) {
    return {
      key: "buiten",
      title: "Klaar voor buiten",
      subtitle: "Buitenverf, beits en tuinklussen voor mooi weer",
      categorySlug: "tuin",
      href: "/categorie/tuin",
    };
  }

  // Najaar (sep–nov): interieur winterklaar.
  if (m >= 8 && m <= 10) {
    return {
      key: "najaar",
      title: "Maak je interieur winterklaar",
      subtitle: "Frisse muurverf en lak voor binnen",
      categorySlug: "verf",
      href: "/categorie/verf",
    };
  }

  // Winter (jan–feb): binnen klussen.
  return {
    key: "winter",
    title: "De fijnste klusdagen zijn binnen",
    subtitle: "Verf, gereedschap en alles voor je binnenklus",
    categorySlug: "verf",
    href: "/categorie/verf",
  };
}
