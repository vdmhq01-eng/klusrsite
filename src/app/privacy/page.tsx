import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, COMPANY } from "@/components/shared/legal-page";

export const metadata: Metadata = {
  title: "Privacyverklaring | KLUSR",
  description:
    "Hoe KLUSR omgaat met je persoonsgegevens conform de AVG: welke gegevens we verwerken, waarom, hoe lang en welke rechten je hebt.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacyverklaring"
      updated="15 juni 2026"
      intro="KLUSR respecteert je privacy en verwerkt persoonsgegevens in overeenstemming met de Algemene Verordening Gegevensbescherming (AVG). In deze verklaring lees je welke gegevens we verwerken, waarom, hoe lang en welke rechten je hebt."
      sections={[
        {
          heading: "1. Verwerkingsverantwoordelijke",
          body: (
            <p>
              {COMPANY.legalName} ({COMPANY.tradeName}), {COMPANY.address}, is verantwoordelijk
              voor de verwerking van persoonsgegevens zoals beschreven in deze verklaring. Vragen
              over privacy? Mail naar <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
            </p>
          ),
        },
        {
          heading: "2. Welke gegevens we verwerken",
          body: (
            <ul>
              <li>NAW-gegevens, e-mailadres en telefoonnummer (voor bestelling en bezorging);</li>
              <li>bestel- en betaalgegevens, inclusief gekozen (meng)kleuren;</li>
              <li>accountgegevens en voorkeuren, KLUSRPAS-lidmaatschap;</li>
              <li>communicatie met onze klantenservice;</li>
              <li>technische gegevens zoals IP-adres, apparaat en surfgedrag via cookies.</li>
            </ul>
          ),
        },
        {
          heading: "3. Doeleinden en grondslagen",
          body: (
            <ul>
              <li>
                <strong>Uitvoeren van je bestelling</strong> (grondslag: uitvoering overeenkomst);
              </li>
              <li>
                <strong>Klantenservice en garantie</strong> (overeenkomst / gerechtvaardigd
                belang);
              </li>
              <li>
                <strong>Nieuwsbrief en aanbiedingen</strong> (toestemming, in te trekken via
                iedere mailing);
              </li>
              <li>
                <strong>Verbeteren van de website en analyse</strong> (toestemming voor
                niet-functionele cookies);
              </li>
              <li>
                <strong>Voldoen aan wettelijke verplichtingen</strong> zoals de fiscale
                bewaarplicht.
              </li>
            </ul>
          ),
        },
        {
          heading: "4. Bewaartermijnen",
          body: (
            <p>
              We bewaren je gegevens niet langer dan nodig. Bestel- en factuurgegevens bewaren we
              vanwege de wettelijke fiscale bewaarplicht 7 jaar. Accountgegevens bewaren we
              zolang je een account hebt. Gegevens voor de nieuwsbrief bewaren we tot je je
              afmeldt.
            </p>
          ),
        },
        {
          heading: "5. Delen met derden",
          body: (
            <>
              <p>
                We delen gegevens alleen wanneer dat nodig is voor onze dienstverlening of
                wettelijk verplicht is, met onder andere:
              </p>
              <ul>
                <li>betaaldienstverlener Mollie (afhandeling betalingen);</li>
                <li>
                  onze orderverwerking en kassasysteem (Channable en Tilroy) voor bestelling en
                  voorraad;
                </li>
                <li>bezorgdiensten voor de levering;</li>
                <li>analyse- en marketingdiensten, uitsluitend met jouw cookietoestemming.</li>
              </ul>
              <p>
                Met deze partijen sluiten we waar nodig verwerkersovereenkomsten. We verkopen je
                gegevens nooit.
              </p>
            </>
          ),
        },
        {
          heading: "6. Cookies",
          body: (
            <p>
              Onze website gebruikt cookies en vergelijkbare technieken. Wat we precies inzetten
              en hoe je je voorkeuren beheert, lees je in ons{" "}
              <Link href="/cookiebeleid">cookiebeleid</Link>.
            </p>
          ),
        },
        {
          heading: "7. Beveiliging",
          body: (
            <p>
              We nemen passende technische en organisatorische maatregelen om je gegevens te
              beschermen tegen verlies of onrechtmatige verwerking, waaronder versleutelde
              verbindingen (TLS) en toegangsbeperkingen.
            </p>
          ),
        },
        {
          heading: "8. Jouw rechten",
          body: (
            <>
              <p>Op grond van de AVG heb je het recht om:</p>
              <ul>
                <li>je gegevens in te zien, te corrigeren of te laten verwijderen;</li>
                <li>de verwerking te beperken of daartegen bezwaar te maken;</li>
                <li>je gegevens over te laten dragen (dataportabiliteit);</li>
                <li>een eerder gegeven toestemming in te trekken.</li>
              </ul>
              <p>
                Stuur je verzoek naar <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>. We
                reageren binnen één maand.
              </p>
            </>
          ),
        },
        {
          heading: "9. Klacht indienen",
          body: (
            <p>
              Ben je het niet eens met hoe we met je gegevens omgaan? Dan kun je een klacht
              indienen bij de{" "}
              <a href="https://autoriteitpersoonsgegevens.nl" rel="noreferrer nofollow">
                Autoriteit Persoonsgegevens
              </a>
              .
            </p>
          ),
        },
        {
          heading: "10. Wijzigingen",
          body: (
            <p>
              We kunnen deze privacyverklaring aanpassen. De meest actuele versie vind je altijd
              op deze pagina. Vragen? Neem contact op met onze{" "}
              <Link href="/klantenservice">klantenservice</Link>.
            </p>
          ),
        },
      ]}
    />
  );
}
