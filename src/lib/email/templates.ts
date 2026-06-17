import type { CartItem, Order, Product } from "@/types";
import { flagshipStore } from "@/lib/data/stores";
import { products, getBestsellers } from "@/lib/data/products";

/**
 * Gebrande KLUSR e-mailtemplates (HTML + platte tekst).
 *
 * Bewust table-based met inline styles: dat is wat e-mailclients (Gmail,
 * Outlook, Apple Mail) betrouwbaar renderen. De huisstijl volgt de webshop —
 * KLUS-woordmerk met de R in een rood tegeltje, zwarte header, rode CTA.
 */

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.klus-r.nl").replace(/\/$/, "");
const CONTACT_EMAIL = process.env.EMAIL_REPLY_TO || "klantenservice@klus-r.nl";

/** KLUSR huisstijlkleuren (gespiegeld vanuit tailwind.config.ts). */
const C = {
  red: "#C90000",
  black: "#101010",
  bg: "#F7F7F7",
  card: "#FFFFFF",
  border: "#E5E5E5",
  green: "#16A34A",
  text: "#101010",
  muted: "#6B7280",
};

const euroFmt = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" });
const euro = (n: number) => euroFmt.format(n);

function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(iso?: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("nl-NL", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  } catch {
    return "";
  }
}

const PAYMENT_LABELS: Record<string, string> = {
  ideal: "iDEAL",
  bancontact: "Bancontact",
  creditcard: "Creditcard",
  klarna: "Klarna — achteraf betalen",
};

function paymentLabel(method?: string): string {
  if (!method) return "—";
  return PAYMENT_LABELS[method] ?? method;
}

/** KLUS + R-tegel, voor op de zwarte header. */
function wordmark(): string {
  return (
    `<span style="font-size:26px;font-weight:900;letter-spacing:-0.5px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">KLUS</span>` +
    `<span style="display:inline-block;background:${C.red};color:#ffffff;font-size:22px;font-weight:900;line-height:1;padding:5px 9px;border-radius:6px;margin-left:3px;font-family:Arial,Helvetica,sans-serif;">R</span>`
  );
}

function button(label: string, url: string): string {
  return (
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>` +
    `<td align="center" bgcolor="${C.red}" style="border-radius:8px;">` +
    `<a href="${url}" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px;">${esc(label)}</a>` +
    `</td></tr></table>`
  );
}

function footer(note?: string): string {
  const tel = flagshipStore.phone.replace(/[\s-]/g, "");
  return (
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">` +
    `<tr><td style="padding-bottom:14px;border-bottom:1px solid ${C.border};font-family:Arial,Helvetica,sans-serif;">` +
    `<span style="font-size:13px;color:${C.muted};line-height:1.7;">` +
    `<strong style="color:${C.text};">KLUSR B.V.</strong><br>` +
    `${esc(flagshipStore.address)}, ${esc(flagshipStore.postalCode)} ${esc(flagshipStore.city)}<br>` +
    `<a href="tel:${tel}" style="color:${C.muted};text-decoration:none;">${esc(flagshipStore.phone)}</a> &middot; ` +
    `<a href="mailto:${esc(CONTACT_EMAIL)}" style="color:${C.muted};text-decoration:none;">${esc(CONTACT_EMAIL)}</a> &middot; ` +
    `<a href="${SITE_URL}" style="color:${C.red};text-decoration:none;font-weight:bold;">klus-r.nl</a>` +
    `</span></td></tr>` +
    `<tr><td style="padding-top:14px;font-family:Arial,Helvetica,sans-serif;">` +
    `<span style="font-size:11px;color:${C.muted};line-height:1.7;">` +
    (note ? `${esc(note)}<br>` : "") +
    `&copy; ${new Date().getFullYear()} KLUSR B.V. — Alle prijzen incl. btw. ` +
    `<a href="${SITE_URL}/voorwaarden" style="color:${C.muted};">Voorwaarden</a> &middot; ` +
    `<a href="${SITE_URL}/privacy" style="color:${C.muted};">Privacy</a>` +
    `</span></td></tr></table>`
  );
}

/** Merken die we voeren (dynamisch uit de catalogus, met curated fallback). */
const TOP_BRANDS: string[] = (() => {
  try {
    const counts = new Map<string, number>();
    for (const p of products) {
      const b = (p.brand || "").trim();
      if (b) counts.set(b, (counts.get(b) || 0) + 1);
    }
    const top = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([b]) => b);
    if (top.length) return top;
  } catch {
    /* val terug op curated lijst */
  }
  return ["Histor", "Flexa", "Sikkens", "Sigma", "Dulux", "Hermadix", "Rambo", "Wagner", "Bosch", "Makita"];
})();

function prettyBrand(b: string): string {
  if (b && b === b.toUpperCase() && b.length > 2) return b.charAt(0) + b.slice(1).toLowerCase();
  return b || "KLUSR";
}

function clampText(s: string, max: number): string {
  const t = (s || "").trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}

function productTile(p: Product): string {
  const url = `${SITE_URL}/product/${esc(p.slug)}`;
  const first = p.images?.[0];
  const img =
    first && /^https?:\/\//.test(first)
      ? `<img src="${esc(first)}" width="160" alt="" style="display:block;width:100%;max-width:170px;height:auto;border-radius:8px;border:1px solid ${C.border};background:#fff;">`
      : `<div style="width:100%;height:0;padding-top:75%;border-radius:8px;border:1px solid ${C.border};background:${C.bg};"></div>`;
  return (
    `<td valign="top" width="33%" style="padding:6px;font-family:Arial,Helvetica,sans-serif;">` +
    `<a href="${url}" style="text-decoration:none;color:${C.text};display:block;">` +
    img +
    `<div style="margin-top:8px;font-size:10px;letter-spacing:0.04em;color:${C.muted};text-transform:uppercase;font-weight:bold;">${esc(prettyBrand(p.brand))}</div>` +
    `<div style="font-size:13px;line-height:1.35;color:${C.text};font-weight:bold;">${esc(clampText(p.title, 44))}</div>` +
    `<div style="margin-top:4px;font-size:14px;color:${C.red};font-weight:bold;">${euro(p.kluspasPrice || p.price)}</div>` +
    `</a></td>`
  );
}

/**
 * Promoblok met klustoppers + de merken die we verkopen. Wordt in ELKE mail
 * getoond zodat er altijd een kans op aankoop is.
 */
function promoBlock(): string {
  let items: Product[] = [];
  try {
    items = getBestsellers(6);
    if (items.length < 3) items = items.concat(products.filter((p) => !items.includes(p)));
  } catch {
    /* geen producten beschikbaar */
  }
  const tiles = items.slice(0, 3).map(productTile).join("");
  if (!tiles) return "";
  const brands = TOP_BRANDS.map((b) => esc(prettyBrand(b))).join(" &middot; ");
  return (
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">` +
    `<tr><td style="border-top:1px solid ${C.border};padding-top:22px;font-family:Arial,Helvetica,sans-serif;">` +
    `<p style="margin:0 0 2px;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:0.05em;color:${C.red};">Onze klustoppers</p>` +
    `<p style="margin:0 0 14px;font-size:18px;font-weight:900;color:${C.text};">Maak je klus compleet</p>` +
    `</td></tr>` +
    `<tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${tiles}</tr></table></td></tr>` +
    `<tr><td style="padding:16px 0 6px;font-size:12px;line-height:1.6;color:${C.muted};font-family:Arial,Helvetica,sans-serif;">` +
    `<strong style="color:${C.text};">De merken die we verkopen:</strong> ${brands} en meer.` +
    `</td></tr>` +
    `<tr><td style="padding:10px 0 2px;">${button("Shop het hele assortiment", SITE_URL)}</td></tr>` +
    `</table>`
  );
}

interface LayoutOpts {
  title: string;
  preheader: string;
  content: string;
  footerNote?: string;
}

function layout({ title, preheader, content, footerNote }: LayoutOpts): string {
  const promo = promoBlock();
  const promoRow = promo
    ? `<tr><td bgcolor="${C.card}" style="background:${C.card};padding:4px 30px 30px;border-left:1px solid ${C.border};border-right:1px solid ${C.border};">${promo}</td></tr>`
    : "";
  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:${C.bg};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.bg};">
<tr><td align="center" style="padding:24px 12px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;">
    <tr><td align="center" bgcolor="${C.black}" style="background:${C.black};border-radius:12px 12px 0 0;padding:24px;">
      ${wordmark()}
    </td></tr>
    <tr><td bgcolor="${C.card}" style="background:${C.card};padding:34px 30px;border-left:1px solid ${C.border};border-right:1px solid ${C.border};font-family:Arial,Helvetica,sans-serif;color:${C.text};">
      ${content}
    </td></tr>
    ${promoRow}
    <tr><td bgcolor="${C.card}" style="background:${C.card};border:1px solid ${C.border};border-top:none;border-radius:0 0 12px 12px;padding:22px 30px;">
      ${footer(footerNote)}
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

// --- Order confirmation -----------------------------------------------------

function itemRow(item: CartItem): string {
  const img =
    item.image && /^https?:\/\//.test(item.image)
      ? `<img src="${esc(item.image)}" width="56" height="56" alt="" style="display:block;border-radius:8px;border:1px solid ${C.border};background:#fff;">`
      : `<div style="width:56px;height:56px;border-radius:8px;border:1px solid ${C.border};background:${C.bg};"></div>`;

  const variant =
    item.variantLabel && item.variantLabel.toLowerCase() !== "standaard"
      ? `<br><span style="color:${C.muted};font-size:12px;">${esc(item.variantLabel)}</span>`
      : "";

  const color = item.selectedColor
    ? `<br><span style="color:${C.muted};font-size:12px;">Kleur: ${esc(item.selectedColor.name)}${
        item.selectedColor.code ? ` (${esc(item.selectedColor.code)})` : ""
      }</span>`
    : "";

  return (
    `<tr>` +
    `<td valign="top" style="padding:12px 0;border-bottom:1px solid ${C.border};width:56px;">${img}</td>` +
    `<td valign="top" style="padding:12px 14px;border-bottom:1px solid ${C.border};font-size:14px;color:${C.text};line-height:1.4;">` +
    `<strong>${esc(item.title)}</strong>${variant}${color}` +
    `<br><span style="color:${C.muted};font-size:12px;">${item.quantity} &times; ${euro(item.price)}</span>` +
    `</td>` +
    `<td valign="top" align="right" style="padding:12px 0;border-bottom:1px solid ${C.border};font-size:14px;font-weight:bold;white-space:nowrap;">${euro(
      item.price * item.quantity,
    )}</td>` +
    `</tr>`
  );
}

function totalsRow(label: string, value: string, opts: { color?: string; strong?: boolean; big?: boolean } = {}): string {
  const color = opts.color ?? C.text;
  const weight = opts.strong ? "bold" : "normal";
  const size = opts.big ? "17px" : "14px";
  return (
    `<tr>` +
    `<td style="padding:5px 0;font-size:${size};color:${C.muted};">${esc(label)}</td>` +
    `<td align="right" style="padding:5px 0;font-size:${size};font-weight:${weight};color:${color};white-space:nowrap;">${value}</td>` +
    `</tr>`
  );
}

export function verificationEmail(
  name: string,
  url: string,
): { subject: string; html: string; text: string } {
  const hi = name ? `Hoi ${esc(name.split(" ")[0])},` : "Hoi,";
  const content =
    `<h1 style="margin:0 0 12px;font-size:22px;font-weight:900;color:${C.text};">Bevestig je e-mailadres</h1>` +
    `<p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:${C.text};">${hi} welkom bij KLUSR! Bevestig je e-mailadres om je account te activeren.</p>` +
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;"><tr><td>${button("Bevestig e-mailadres", url)}</td></tr></table>` +
    `<p style="margin:0 0 6px;font-size:13px;line-height:1.6;color:${C.muted};">Werkt de knop niet? Plak deze link in je browser:</p>` +
    `<p style="margin:0 0 18px;font-size:13px;line-height:1.6;"><a href="${url}" style="color:${C.red};word-break:break-all;">${esc(url)}</a></p>` +
    `<p style="margin:0;font-size:12px;color:${C.muted};">Deze link is 24 uur geldig. Heb je je niet aangemeld? Dan kun je deze e-mail negeren.</p>`;
  return {
    subject: "Bevestig je e-mailadres voor KLUSR",
    html: layout({ title: "Bevestig je e-mailadres", preheader: "Activeer je KLUSR-account", content }),
    text: `${hi} bevestig je e-mailadres om je KLUSR-account te activeren:\n${url}\n\nDeze link is 24 uur geldig.`,
  };
}

export function magicLinkEmail(
  name: string,
  url: string,
): { subject: string; html: string; text: string } {
  const hi = name ? `Hoi ${esc(name.split(" ")[0])},` : "Hoi,";
  const content =
    `<h1 style="margin:0 0 12px;font-size:22px;font-weight:900;color:${C.text};">Je inloglink</h1>` +
    `<p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:${C.text};">${hi} klik op de knop om direct in te loggen bij KLUSR — geen wachtwoord nodig.</p>` +
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;"><tr><td>${button("Inloggen bij KLUSR", url)}</td></tr></table>` +
    `<p style="margin:0 0 6px;font-size:13px;line-height:1.6;color:${C.muted};">Werkt de knop niet? Plak deze link in je browser:</p>` +
    `<p style="margin:0 0 18px;font-size:13px;line-height:1.6;"><a href="${url}" style="color:${C.red};word-break:break-all;">${esc(url)}</a></p>` +
    `<p style="margin:0;font-size:12px;color:${C.muted};">Deze link is 30 minuten geldig en werkt één keer. Heb je geen inloglink aangevraagd? Negeer deze e-mail dan.</p>`;
  return {
    subject: "Je inloglink voor KLUSR",
    html: layout({ title: "Je inloglink", preheader: "Log direct in bij KLUSR", content }),
    text: `${hi} log in bij KLUSR via deze link (30 min geldig):\n${url}`,
  };
}

export function passwordResetEmail(
  name: string,
  url: string,
): { subject: string; html: string; text: string } {
  const hi = name ? `Hoi ${esc(name.split(" ")[0])},` : "Hoi,";
  const content =
    `<h1 style="margin:0 0 12px;font-size:22px;font-weight:900;color:${C.text};">Stel je wachtwoord opnieuw in</h1>` +
    `<p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:${C.text};">${hi} je (of iemand anders) heeft gevraagd om je KLUSR-wachtwoord opnieuw in te stellen. Klik op de knop om een nieuw wachtwoord te kiezen.</p>` +
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;"><tr><td>${button("Nieuw wachtwoord instellen", url)}</td></tr></table>` +
    `<p style="margin:0 0 6px;font-size:13px;line-height:1.6;color:${C.muted};">Werkt de knop niet? Plak deze link in je browser:</p>` +
    `<p style="margin:0 0 18px;font-size:13px;line-height:1.6;"><a href="${url}" style="color:${C.red};word-break:break-all;">${esc(url)}</a></p>` +
    `<p style="margin:0;font-size:12px;color:${C.muted};">Deze link is 60 minuten geldig en werkt één keer. Heb je dit niet aangevraagd? Negeer deze e-mail dan — je wachtwoord blijft ongewijzigd.</p>`;
  return {
    subject: "Stel je KLUSR-wachtwoord opnieuw in",
    html: layout({ title: "Stel je wachtwoord opnieuw in", preheader: "Kies een nieuw wachtwoord voor je KLUSR-account", content }),
    text: `${hi} stel je KLUSR-wachtwoord opnieuw in via deze link (60 min geldig):\n${url}\n\nHeb je dit niet aangevraagd? Negeer deze e-mail dan — je wachtwoord blijft ongewijzigd.`,
  };
}

// --- Klantenservice / tickets ----------------------------------------------

/** Escape + behoud regelovergangen voor weergave in HTML-mails. */
function nl2br(s: string): string {
  return esc(s).replace(/\r?\n/g, "<br>");
}

/** Ontvangstbevestiging van een klantenservicevraag. */
export function supportConfirmationEmail(
  name: string,
  reference: string,
  subject: string,
  body: string,
): { subject: string; html: string; text: string } {
  const hi = name ? `Hoi ${esc(name.split(" ")[0])},` : "Hoi,";
  const content =
    `<h1 style="margin:0 0 12px;font-size:22px;font-weight:900;color:${C.text};">We hebben je bericht ontvangen</h1>` +
    `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${C.text};">${hi} bedankt voor je bericht aan de KLUSR-klantenservice. Onze klussers kijken er zo snel mogelijk naar — meestal binnen 1 werkdag.</p>` +
    `<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${C.muted};">Je ticketnummer is <strong style="color:${C.text};">${esc(reference)}</strong>. Houd dit nummer in de onderwerpregel als je reageert, dan koppelen we je bericht automatisch.</p>` +
    `<div style="margin:0 0 8px;padding:16px;border:1px solid ${C.border};border-radius:10px;background:${C.bg};">` +
    `<p style="margin:0 0 6px;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:0.04em;color:${C.muted};">${esc(subject)}</p>` +
    `<p style="margin:0;font-size:14px;line-height:1.6;color:${C.text};">${nl2br(body)}</p>` +
    `</div>`;
  return {
    subject: `We hebben je bericht ontvangen [${reference}]`,
    html: layout({
      title: "Bericht ontvangen",
      preheader: `Je ticketnummer is ${reference}`,
      content,
      footerNote: `Reageren? Houd ${reference} in de onderwerpregel.`,
    }),
    text: `${hi} bedankt voor je bericht aan de KLUSR-klantenservice.\nJe ticketnummer is ${reference}. We reageren meestal binnen 1 werkdag.\n\nOnderwerp: ${subject}\n${body}`,
  };
}

/** Antwoord van de klantenservice op een ticket. */
export function supportReplyEmail(
  name: string,
  reference: string,
  replyBody: string,
): { subject: string; html: string; text: string } {
  const hi = name ? `Hoi ${esc(name.split(" ")[0])},` : "Hoi,";
  const content =
    `<h1 style="margin:0 0 12px;font-size:22px;font-weight:900;color:${C.text};">Antwoord van de klantenservice</h1>` +
    `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${C.text};">${hi}</p>` +
    `<p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:${C.text};">${nl2br(replyBody)}</p>` +
    `<p style="margin:0;font-size:13px;line-height:1.6;color:${C.muted};">Heb je nog een vraag? Beantwoord deze e-mail en houd <strong style="color:${C.text};">${esc(reference)}</strong> in de onderwerpregel, dan pakken we het direct weer op.</p>`;
  return {
    subject: `Re: je vraag aan KLUSR [${reference}]`,
    html: layout({
      title: "Antwoord van de klantenservice",
      preheader: replyBody.slice(0, 100),
      content,
      footerNote: `Ticket ${reference}`,
    }),
    text: `${hi}\n\n${replyBody}\n\nHeb je nog een vraag? Beantwoord deze e-mail en houd ${reference} in de onderwerpregel.`,
  };
}

export function abandonedCartEmail(input: {
  name?: string;
  items: { title: string; quantity: number; price: number }[];
  total: number;
}): { subject: string; html: string; text: string } {
  const hi = input.name ? `Hoi ${esc(input.name.split(" ")[0])},` : "Hoi,";
  const cartUrl = `${SITE_URL}/winkelwagen`;
  const rows = input.items
    .slice(0, 8)
    .map(
      (it) =>
        `<tr>` +
        `<td style="padding:8px 0;border-bottom:1px solid ${C.border};font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${C.text};">${esc(it.title)}${it.quantity > 1 ? ` <span style="color:${C.muted};">× ${it.quantity}</span>` : ""}</td>` +
        `<td align="right" style="padding:8px 0;border-bottom:1px solid ${C.border};font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:${C.text};white-space:nowrap;">${euro(it.price * it.quantity)}</td>` +
        `</tr>`,
    )
    .join("");
  const content =
    `<h1 style="margin:0 0 12px;font-size:22px;font-weight:900;color:${C.text};">Je winkelwagen wacht nog op je</h1>` +
    `<p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:${C.text};">${hi} je liet wat moois achter in je winkelwagen. We hebben het voor je bewaard — rond je bestelling af voordat het uitverkocht is.</p>` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;">${rows}` +
    `<tr><td style="padding:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:900;color:${C.text};">Totaal</td>` +
    `<td align="right" style="padding:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:900;color:${C.red};">${euro(input.total)}</td></tr></table>` +
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;"><tr><td>${button("Rond je bestelling af", cartUrl)}</td></tr></table>` +
    `<p style="margin:0;font-size:13px;color:${C.muted};">Voor 19:00 besteld, morgen in huis. Met de gratis KLUSRPAS pak je bovendien altijd extra voordeel.</p>`;
  return {
    subject: "Je winkelwagen staat nog klaar bij KLUSR",
    html: layout({
      title: "Je winkelwagen wacht nog op je",
      preheader: "Rond je bestelling af — voor 19:00 besteld, morgen in huis.",
      content,
      footerNote: "Je ontvangt deze herinnering omdat je een bestelling bij KLUSR bent begonnen.",
    }),
    text:
      `${hi} je liet wat moois achter in je winkelwagen bij KLUSR.\n` +
      input.items.map((it) => `- ${it.title}${it.quantity > 1 ? ` x${it.quantity}` : ""}`).join("\n") +
      `\nTotaal: ${euro(input.total)}\n\nRond je bestelling af: ${cartUrl}`,
  };
}

export function orderConfirmationEmail(order: Order): { subject: string; html: string; text: string } {
  const c = order.customer;
  const trackUrl = `${SITE_URL}/bestelstatus`;
  const delivery = formatDate(order.estimatedDelivery);

  const itemsTable =
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 4px;">` +
    order.items.map(itemRow).join("") +
    `</table>`;

  const totals =
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">` +
    totalsRow("Subtotaal", euro(order.subtotal)) +
    (order.kluspasSavings > 0 ? totalsRow("KLUSRPAS-korting", `- ${euro(order.kluspasSavings)}`, { color: C.green }) : "") +
    totalsRow(
      "Verzending",
      order.shipping > 0 ? euro(order.shipping) : "Gratis",
      order.shipping > 0 ? {} : { color: C.green },
    ) +
    `<tr><td colspan="2" style="padding:8px 0 0;"><div style="border-top:2px solid ${C.black};"></div></td></tr>` +
    totalsRow("Totaal", euro(order.total), { strong: true, big: true }) +
    `</table>`;

  const addressBlock =
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">` +
    `<tr>` +
    `<td valign="top" width="50%" style="padding:0 10px 0 0;font-size:13px;color:${C.text};line-height:1.6;">` +
    `<strong style="display:block;margin-bottom:4px;color:${C.muted};text-transform:uppercase;font-size:11px;letter-spacing:0.5px;">Bezorgadres</strong>` +
    `${esc(c.firstName)} ${esc(c.lastName)}<br>${esc(c.street)}<br>${esc(c.postalCode)} ${esc(c.city)}` +
    `</td>` +
    `<td valign="top" width="50%" style="padding:0 0 0 10px;font-size:13px;color:${C.text};line-height:1.6;">` +
    `<strong style="display:block;margin-bottom:4px;color:${C.muted};text-transform:uppercase;font-size:11px;letter-spacing:0.5px;">Bezorging</strong>` +
    (delivery ? `Verwacht: <strong>${esc(delivery)}</strong><br>` : "") +
    `Voor 19:00 besteld, morgen in huis<br>` +
    `Betaling: ${esc(paymentLabel(order.paymentMethod))}` +
    `</td>` +
    `</tr></table>`;

  const content = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;">
      <tr>
        <td valign="middle" style="width:44px;">
          <div style="width:40px;height:40px;border-radius:50%;background:${C.green};color:#ffffff;text-align:center;line-height:40px;font-size:22px;font-weight:bold;">&#10003;</div>
        </td>
        <td valign="middle" style="padding-left:12px;">
          <h1 style="margin:0;font-size:22px;color:${C.text};font-family:Arial,Helvetica,sans-serif;">Bedankt voor je bestelling!</h1>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:${C.text};">
      Hoi ${esc(c.firstName)}, we hebben je bestelling ontvangen en gaan er direct mee aan de slag.
      Je ontvangt een bericht zodra je pakket onderweg is.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;background:${C.bg};border-radius:10px;">
      <tr><td style="padding:14px 18px;font-size:14px;color:${C.text};">
        <span style="color:${C.muted};">Bestelnummer</span><br>
        <strong style="font-size:20px;letter-spacing:0.5px;">${esc(order.reference)}</strong>
      </td></tr>
    </table>

    <h2 style="margin:0 0 4px;font-size:15px;color:${C.text};">Je bestelling</h2>
    ${itemsTable}
    ${totals}

    <div style="height:24px;"></div>
    ${addressBlock}

    <div style="height:28px;"></div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">
      ${button("Volg je bestelling", trackUrl)}
    </td></tr></table>

    <p style="margin:16px 0 0;font-size:13px;line-height:1.6;text-align:center;">
      <a href="${SITE_URL}/factuur/${order.id}" style="color:${C.red};text-decoration:none;font-weight:bold;">Download je factuur (PDF)</a>
    </p>

    <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:${C.muted};text-align:center;">
      Vragen over je bestelling? Mail naar
      <a href="mailto:${esc(CONTACT_EMAIL)}" style="color:${C.red};text-decoration:none;">${esc(CONTACT_EMAIL)}</a>
      of bel ${esc(flagshipStore.phone)}.
    </p>
  `;

  const text = orderConfirmationText(order);

  return {
    subject: `Bestelbevestiging ${order.reference} — KLUSR`,
    html: layout({
      title: `Bestelbevestiging ${order.reference}`,
      preheader: `Bedankt ${c.firstName}! We hebben je bestelling ${order.reference} ontvangen (${euro(order.total)}).`,
      content,
    }),
    text,
  };
}

function orderConfirmationText(order: Order): string {
  const c = order.customer;
  const lines: string[] = [];
  lines.push("Bedankt voor je bestelling bij KLUSR!");
  lines.push("");
  lines.push(`Hoi ${c.firstName}, we hebben je bestelling ontvangen.`);
  lines.push(`Bestelnummer: ${order.reference}`);
  lines.push("");
  lines.push("Je bestelling:");
  for (const i of order.items) {
    const extra = i.selectedColor ? ` (${i.selectedColor.name})` : "";
    lines.push(`  - ${i.quantity}x ${i.title}${extra} — ${euro(i.price * i.quantity)}`);
  }
  lines.push("");
  lines.push(`Subtotaal:        ${euro(order.subtotal)}`);
  if (order.kluspasSavings > 0) lines.push(`KLUSRPAS-korting: -${euro(order.kluspasSavings)}`);
  lines.push(`Verzending:       ${order.shipping > 0 ? euro(order.shipping) : "Gratis"}`);
  lines.push(`Totaal:           ${euro(order.total)}`);
  lines.push("");
  const delivery = formatDate(order.estimatedDelivery);
  if (delivery) lines.push(`Verwachte bezorging: ${delivery}`);
  lines.push(`Bezorgadres: ${c.firstName} ${c.lastName}, ${c.street}, ${c.postalCode} ${c.city}`);
  lines.push("");
  lines.push(`Volg je bestelling: ${SITE_URL}/bestelstatus`);
  lines.push(`Vragen? ${CONTACT_EMAIL} of ${flagshipStore.phone}`);
  lines.push("");
  lines.push("KLUSR B.V. — De beste verf en alles wat je NÚ nodig hebt voor de klus.");
  return lines.join("\n");
}

/** "Je bestelling is onderweg" — verzonden bij het aanmaken van het label. */
export function shippingConfirmationEmail(order: Order): { subject: string; html: string; text: string } {
  const c = order.customer;
  const ship = order.shipment;
  const trackUrl = ship?.trackTrace || `${SITE_URL}/bestelstatus`;
  const delivery = formatDate(order.estimatedDelivery);

  const itemsTable =
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 4px;">` +
    order.items.map(itemRow).join("") +
    `</table>`;

  const trackBox =
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;background:${C.bg};border-radius:10px;">` +
    `<tr><td style="padding:14px 18px;font-size:14px;color:${C.text};">` +
    `<span style="color:${C.muted};">Bestelnummer</span><br>` +
    `<strong style="font-size:20px;letter-spacing:0.5px;">${esc(order.reference)}</strong>` +
    (ship?.barcode
      ? `<br><span style="color:${C.muted};">Track &amp; trace-code</span><br><strong style="font-size:16px;letter-spacing:0.5px;">${esc(ship.barcode)}</strong>`
      : "") +
    `</td></tr></table>`;

  const content = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;">
      <tr>
        <td valign="middle" style="width:44px;">
          <div style="width:40px;height:40px;border-radius:50%;background:${C.red};color:#ffffff;text-align:center;line-height:40px;font-size:20px;font-weight:bold;">&#128666;</div>
        </td>
        <td valign="middle" style="padding-left:12px;">
          <h1 style="margin:0;font-size:22px;color:${C.text};font-family:Arial,Helvetica,sans-serif;">Je bestelling is onderweg!</h1>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${C.text};">
      Hoi ${esc(c.firstName)}, goed nieuws — je bestelling is zojuist met PostNL verzonden${delivery ? "" : " en hard op weg naar je toe"}.
    </p>

    ${
      delivery
        ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;"><tr>` +
          `<td style="padding:12px 16px;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;font-size:15px;color:${C.text};">` +
          `&#128666;&nbsp; Verwachte bezorging: <strong style="color:${C.green};">${esc(delivery)}</strong>` +
          `</td></tr></table>`
        : ""
    }

    ${trackBox}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">
      ${button("Volg je pakket", trackUrl)}
    </td></tr></table>

    <div style="height:24px;"></div>
    <h2 style="margin:0 0 4px;font-size:15px;color:${C.text};">Wat er onderweg is</h2>
    ${itemsTable}

    <div style="height:24px;"></div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td valign="top" style="font-size:13px;color:${C.text};line-height:1.6;">
        <strong style="display:block;margin-bottom:4px;color:${C.muted};text-transform:uppercase;font-size:11px;letter-spacing:0.5px;">Bezorgadres</strong>
        ${esc(c.firstName)} ${esc(c.lastName)}<br>${esc(c.street)}<br>${esc(c.postalCode)} ${esc(c.city)}
      </td></tr>
    </table>

    <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:${C.muted};text-align:center;">
      Vragen over je bezorging? Mail naar
      <a href="mailto:${esc(CONTACT_EMAIL)}" style="color:${C.red};text-decoration:none;">${esc(CONTACT_EMAIL)}</a>
      of bel ${esc(flagshipStore.phone)}.
    </p>
  `;

  const textLines = [
    "Je bestelling is onderweg!",
    "",
    `Hoi ${c.firstName}, je bestelling ${order.reference} is zojuist met PostNL verzonden.`,
    ship?.barcode ? `Track & trace-code: ${ship.barcode}` : "",
    delivery ? `Verwachte bezorging: ${delivery}` : "",
    "",
    "Wat er onderweg is:",
    ...order.items.map((i) => `  - ${i.quantity}x ${i.title}${i.selectedColor ? ` (${i.selectedColor.name})` : ""}`),
    "",
    `Volg je pakket: ${trackUrl}`,
    `Bezorgadres: ${c.firstName} ${c.lastName}, ${c.street}, ${c.postalCode} ${c.city}`,
    "",
    `Vragen? ${CONTACT_EMAIL} of ${flagshipStore.phone}`,
  ].filter(Boolean);

  return {
    subject: `Je bestelling ${order.reference} is onderweg — KLUSR`,
    html: layout({
      title: `Je bestelling ${order.reference} is onderweg`,
      preheader: `Hoi ${c.firstName}, je pakket is verzonden met PostNL.${delivery ? ` Verwacht: ${delivery}.` : ""}`,
      content,
    }),
    text: textLines.join("\n"),
  };
}

// --- Newsletter welcome -----------------------------------------------------

export function welcomeEmail({ firstName }: { firstName?: string }): {
  subject: string;
  html: string;
  text: string;
} {
  const hi = firstName ? `Hoi ${esc(firstName)}, welkom` : "Welkom";

  const content = `
    <h1 style="margin:0 0 16px;font-size:23px;color:${C.text};font-family:Arial,Helvetica,sans-serif;">${hi} bij KLUSR!</h1>

    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${C.text};">
      Top dat je erbij bent. Vanaf nu ben je als eerste op de hoogte van klustips van
      onze ex-schilders, inspiratie en de scherpste <strong>KLUSRPAS</strong>-aanbiedingen.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;background:${C.bg};border-radius:10px;">
      <tr><td style="padding:18px 20px;font-size:14px;line-height:1.7;color:${C.text};">
        <strong>Wat je van ons krijgt:</strong><br>
        &#10003; Advies van ex-schilders &mdash; geen verkooppraatjes<br>
        &#10003; Professionele kwaliteit voor de eerlijkste prijs<br>
        &#10003; Voor 19:00 besteld, morgen in huis
      </td></tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center">
      ${button("Ontdek het assortiment", SITE_URL)}
    </td></tr></table>
  `;

  const text = [
    `${firstName ? `Hoi ${firstName}, welkom` : "Welkom"} bij KLUSR!`,
    "",
    "Top dat je erbij bent. Vanaf nu ben je als eerste op de hoogte van klustips,",
    "inspiratie en de scherpste KLUSRPAS-aanbiedingen.",
    "",
    `Ontdek het assortiment: ${SITE_URL}`,
    "",
    "KLUSR B.V.",
  ].join("\n");

  return {
    subject: "Welkom bij KLUSR — klustips & KLUSRPAS-deals",
    html: layout({
      title: "Welkom bij KLUSR",
      preheader: "Klustips van ex-schilders en de scherpste KLUSRPAS-aanbiedingen, als eerste in je inbox.",
      content,
      footerNote: "Je ontvangt deze e-mail omdat je je hebt ingeschreven voor de KLUSR-nieuwsbrief.",
    }),
    text,
  };
}
