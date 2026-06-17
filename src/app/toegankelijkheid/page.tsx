import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { flagshipStore } from "@/lib/data/stores";

export const metadata: Metadata = {
  title: "Toegankelijkheidsverklaring",
  description:
    "KLUSR streeft naar een website die voor iedereen toegankelijk is, conform WCAG 2.1 niveau AA en de European Accessibility Act.",
};

const CONTACT_EMAIL = process.env.EMAIL_REPLY_TO || "klantenservice@klus-r.nl";

export default function ToegankelijkheidPage() {
  const today = new Date().toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="container-klusr py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Toegankelijkheidsverklaring</h1>
        <p className="mt-3 text-muted-foreground">
          KLUSR vindt het belangrijk dat onze webshop voor iedereen goed te gebruiken is — ook voor
          mensen die met een schermlezer, alleen het toetsenbord of met aangepaste instellingen
          surfen. We werken er doorlopend aan om te voldoen aan{" "}
          <strong className="text-foreground">WCAG 2.1 niveau AA</strong> en de Europese
          toegankelijkheidsrichtlijn (European Accessibility Act).
        </p>

        <Section title="Wat we hebben gedaan">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Semantische opboup met duidelijke koppen, oriëntatiepunten (header, navigatie, hoofdinhoud, footer) en een &ldquo;Naar hoofdinhoud&rdquo;-snelkoppeling.</li>
            <li>Volledige bediening met het toetsenbord en een goed zichtbare focus-indicator.</li>
            <li>Tekstalternatieven (alt-teksten) bij afbeeldingen en toegankelijke namen voor knoppen en iconen.</li>
            <li>Labels en foutmeldingen bij formulieren (bestellen, inloggen, contact).</li>
            <li>Voldoende kleurcontrast en informatie die niet alleen op kleur leunt.</li>
            <li>Respect voor de systeeminstelling &ldquo;verminder beweging&rdquo;: animaties worden dan uitgeschakeld.</li>
            <li>Responsief ontwerp dat ook bij 200% inzoomen bruikbaar blijft.</li>
          </ul>
        </Section>

        <Section title="Waar we nog aan werken">
          <p>
            Toegankelijkheid is nooit &ldquo;af&rdquo;. We toetsen nieuwe functies en pagina&apos;s
            en verbeteren waar nodig. Loop je tegen iets aan? Laat het ons weten — we lossen het zo
            snel mogelijk op en denken graag met je mee.
          </p>
        </Section>

        <Section title="Een probleem melden">
          <p>Kom je een drempel tegen op onze site? Neem dan contact op:</p>
          <div className="mt-3 flex flex-col gap-2">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"
            >
              <Mail className="h-4 w-4" /> {CONTACT_EMAIL}
            </a>
            <a
              href={`tel:${flagshipStore.phone.replace(/[\s-]/g, "")}`}
              className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"
            >
              <Phone className="h-4 w-4" /> {flagshipStore.phone}
            </a>
            <Link href="/klantenservice" className="text-sm text-muted-foreground hover:text-primary">
              Of ga naar de klantenservice →
            </Link>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Vermeld je zo duidelijk mogelijk om welke pagina het gaat en wat er misging, dan kunnen
            we je het snelst helpen.
          </p>
        </Section>

        <p className="mt-10 text-xs text-muted-foreground">
          Deze verklaring is voor het laatst bijgewerkt op {today}.
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-extrabold tracking-tight">{title}</h2>
      <div className="mt-2 space-y-2 text-muted-foreground">{children}</div>
    </section>
  );
}
