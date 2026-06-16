import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { Logo } from "./logo";
import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { navCategories } from "@/lib/data/categories";

const serviceLinks = [
  { href: "/klantenservice", label: "Klantenservice" },
  { href: "/faq", label: "Veelgestelde vragen" },
  { href: "/bestelstatus", label: "Bestelstatus volgen" },
  { href: "/klantenservice#verzending", label: "Verzending & retour" },
  { href: "/retourvoorwaarden", label: "Retourvoorwaarden" },
  { href: "/klantenservice#betalen", label: "Veilig betalen" },
  { href: "/klantenservice#garantie", label: "Garantie & service" },
];

const aboutLinks = [
  { href: "/over-klusr", label: "Over KLUSR" },
  { href: "/kluspas", label: "KLUSRPAS" },
  { href: "/zakelijk", label: "Zakelijk & ProfPas" },
  { href: "/mengverf", label: "Mengverf" },
  { href: "/advies", label: "Advies & inspiratie" },
  { href: "/klushulp", label: "Klushulp AI" },
  { href: "/werken-bij", label: "Werken bij KLUSR" },
];

export function Footer() {
  return (
    <footer className="mt-16 bg-klusr-black text-white/80">
      {/* Newsletter band */}
      <div className="border-b border-white/10">
        <div className="container-klusr flex flex-col items-start justify-between gap-6 py-10 lg:flex-row lg:items-center">
          <div className="max-w-md">
            <h3 className="text-xl font-extrabold text-white">
              Mis geen enkele actie
            </h3>
            <p className="mt-1 text-sm text-white/70">
              Schrijf je in voor de nieuwsbrief en ontvang klustips, inspiratie en
              de scherpste KLUSRPAS-aanbiedingen.
            </p>
          </div>
          <NewsletterForm className="w-full max-w-md" source="footer" />
        </div>
      </div>

      {/* Link columns */}
      <div className="container-klusr grid grid-cols-2 gap-8 py-12 md:grid-cols-4 lg:grid-cols-5">
        <div className="col-span-2 lg:col-span-1">
          <Logo className="[&_span:first-child]:text-white" />
          <p className="mt-4 text-sm text-white/60">
            De beste VERF en alles wat je NÚ nodig hebt voor de klus. Advies van
            ex-schilders, professionele kwaliteit.
          </p>
          <div className="mt-5 flex gap-3">
            {[Facebook, Instagram, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social media"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-primary"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <FooterColumn title="Assortiment">
          {navCategories.slice(0, 6).map((c) => (
            <FooterLink key={c.slug} href={`/categorie/${c.slug}`}>
              {c.title}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Klantenservice">
          {serviceLinks.map((l) => (
            <FooterLink key={l.href} href={l.href}>
              {l.label}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Over KLUSR">
          {aboutLinks.map((l) => (
            <FooterLink key={l.href} href={l.href}>
              {l.label}
            </FooterLink>
          ))}
        </FooterColumn>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-klusr flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} KLUSR B.V. — Alle prijzen incl. btw.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link href="/voorwaarden" className="hover:text-white">
              Algemene voorwaarden
            </Link>
            <Link href="/retourvoorwaarden" className="hover:text-white">
              Retourvoorwaarden
            </Link>
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/cookiebeleid" className="hover:text-white">
              Cookiebeleid
            </Link>
            <span className="hidden items-center gap-2 sm:flex">
              Veilig betalen via{" "}
              <span className="font-semibold text-white/80">iDEAL · Mollie</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-bold text-white">{title}</h4>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-white/60 transition-colors hover:text-white">
        {children}
      </Link>
    </li>
  );
}
