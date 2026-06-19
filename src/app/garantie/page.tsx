import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, COMPANY } from "@/components/shared/legal-page";

export const metadata: Metadata = {
  title: "Garantie & klachten | KLUSR",
  description:
    "Garantie en klachten bij KLUSR: wettelijke garantie en eventuele fabrieksgarantie, het retouradres, hoe je een klacht meldt en de Geschillencommissie Thuiswinkel en het Europees ODR-platform.",
  alternates: { canonical: "/garantie" },
};

export default function GarantiePage() {
  return (
    <LegalPage
      title="Garantie & klachten"
      updated="19 juni 2026"
      intro="Iets niet in orde met je aankoop? Je hebt altijd recht op de wettelijke garantie. En heb je een klacht, dan lossen we die graag snel en netjes met je op."
      sections={[
        {
          heading: "1. Garantie",
          body: (
            <p>
              Op alle artikelen geldt de <strong>wettelijke garantie</strong>: een product moet
              doen wat je er in alle redelijkheid van mag verwachten. Voor sommige producten geldt
              daarnaast <strong>fabrieksgarantie</strong>; die doet niets af aan je wettelijke
              rechten als consument.
            </p>
          ),
        },
        {
          heading: "2. Retouradres",
          body: (
            <p>
              Stuur je een product retour? Gebruik dan het volgende retouradres:
              <br />
              <strong>{COMPANY.legalName}</strong>
              <br />
              {COMPANY.postalAddress.street}
              <br />
              {COMPANY.postalAddress.postalCode} {COMPANY.postalAddress.city}
              <br />
              {COMPANY.country}
              <br />
              <span className="text-foreground">
                Bekijk eerst onze <Link href="/retourvoorwaarden">retourvoorwaarden</Link> en meld
                je retour aan, zodat we je pakket goed kunnen verwerken.
              </span>
            </p>
          ),
        },
        {
          heading: "3. Klachten",
          body: (
            <p>
              Heb je een klacht? Neem contact op via{" "}
              <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> of {COMPANY.phone}. Je
              ontvangt binnen <strong>14 dagen</strong> na ontvangst van je klacht een inhoudelijke
              reactie.
            </p>
          ),
        },
        {
          heading: "4. Niet tevreden over de afhandeling?",
          body: (
            <p>
              Komen we er samen niet uit? Dan kun je je geschil voorleggen aan de{" "}
              <strong>Geschillencommissie Thuiswinkel</strong> (
              <a
                href="https://www.degeschillencommissie.nl/over-ons/commissies/thuiswinkel/"
                rel="noreferrer nofollow"
                target="_blank"
              >
                degeschillencommissie.nl
              </a>
              ). Je kunt je klacht ook indienen via het{" "}
              <a
                href="https://ec.europa.eu/consumers/odr"
                rel="noreferrer nofollow"
                target="_blank"
              >
                Europees ODR-platform
              </a>
              .
            </p>
          ),
        },
        {
          heading: "Vragen?",
          body: (
            <p>
              Onze <Link href="/klantenservice">klantenservice</Link> helpt je graag verder. Zie
              ook onze <Link href="/voorwaarden">algemene voorwaarden</Link> voor de volledige
              regeling rond garantie, conformiteit en klachten.
            </p>
          ),
        },
      ]}
    />
  );
}
