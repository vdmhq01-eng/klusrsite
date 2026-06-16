import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, COMPANY } from "@/components/shared/legal-page";

export const metadata: Metadata = {
  title: "Privacyverklaring | KLUSR",
  description:
    "Hoe KLUSR omgaat met je persoonsgegevens conform de AVG: welke gegevens we verwerken, waarom, met wie we ze delen, hoe lang we ze bewaren en welke rechten je hebt.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacyverklaring"
      updated="16 juni 2026"
      intro="Je privacy is bij KLUSR in goede handen. We verwerken persoonsgegevens zorgvuldig en in overeenstemming met de Algemene Verordening Gegevensbescherming (AVG). In deze verklaring lees je precies welke gegevens we verwerken, waarom, met wie we ze delen, hoe lang we ze bewaren en welke rechten je hebt."
      sections={[
        {
          heading: "1. Verwerkingsverantwoordelijke",
          body: (
            <p>
              {COMPANY.legalName} ({COMPANY.tradeName}), gevestigd aan {COMPANY.address}{" "}
              (KvK {COMPANY.kvk}), is verwerkingsverantwoordelijke voor de verwerking van
              persoonsgegevens zoals beschreven in deze verklaring. Vragen over privacy of een
              verzoek over je gegevens? Mail naar{" "}
              <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> of bel {COMPANY.phone}.
            </p>
          ),
        },
        {
          heading: "2. Welke gegevens we verwerken",
          body: (
            <ul>
              <li>
                <strong>Contact- en bezorggegevens:</strong> naam, adres, postcode, woonplaats,
                e-mailadres en telefoonnummer;
              </li>
              <li>
                <strong>Bestel- en betaalgegevens:</strong> wat je hebt besteld (incl. gekozen
                (meng)kleuren), bedragen en betaalstatus. Volledige betaalgegevens verwerken we
                niet zelf — die lopen via onze betaalpartner;
              </li>
              <li>
                <strong>Account- en KLUSRPAS-/ProfPas-gegevens:</strong> inloggegevens,
                voorkeuren en, voor zakelijke klanten, bedrijfsnaam, KvK- en btw-nummer;
              </li>
              <li>
                <strong>Communicatie:</strong> berichten met onze klantenservice en de AI-klushulp;
              </li>
              <li>
                <strong>Technische gegevens:</strong> IP-adres, apparaat-/browserinformatie en
                surf- en klikgedrag via cookies (alleen met je toestemming voor niet-functionele
                cookies).
              </li>
            </ul>
          ),
        },
        {
          heading: "3. Doeleinden en grondslagen",
          body: (
            <ul>
              <li>
                <strong>Uitvoeren van je bestelling</strong> en levering (grondslag: uitvoering
                van de overeenkomst);
              </li>
              <li>
                <strong>Klantenservice, retouren en garantie</strong> (overeenkomst /
                gerechtvaardigd belang);
              </li>
              <li>
                <strong>Account- en pasbeheer</strong> (overeenkomst);
              </li>
              <li>
                <strong>Nieuwsbrief en gepersonaliseerde aanbiedingen</strong> (toestemming, op
                ieder moment in te trekken);
              </li>
              <li>
                <strong>Analyse, verbetering en advertenties</strong> (toestemming via de
                cookiebanner);
              </li>
              <li>
                <strong>Fraudepreventie en beveiliging</strong> (gerechtvaardigd belang);
              </li>
              <li>
                <strong>Wettelijke verplichtingen</strong>, zoals de fiscale bewaarplicht.
              </li>
            </ul>
          ),
        },
        {
          heading: "4. Bewaartermijnen",
          body: (
            <p>
              We bewaren je gegevens niet langer dan nodig. Bestel- en factuurgegevens bewaren we
              vanwege de wettelijke fiscale bewaarplicht <strong>7 jaar</strong>. Accountgegevens
              bewaren we zolang je een account hebt; na verwijdering wissen of anonimiseren we ze.
              Nieuwsbriefgegevens bewaren we tot je je afmeldt. Klantcontact bewaren we maximaal
              24 maanden na afhandeling.
            </p>
          ),
        },
        {
          heading: "5. Met wie we gegevens delen",
          body: (
            <>
              <p>
                We delen gegevens alleen wanneer dat nodig is voor onze dienstverlening of
                wettelijk verplicht is, met zorgvuldig geselecteerde verwerkers:
              </p>
              <ul>
                <li>
                  <strong>Mollie</strong> — afhandeling van betalingen;
                </li>
                <li>
                  <strong>Channable &amp; Tilroy</strong> — orderverwerking, voorraad en
                  kassasysteem;
                </li>
                <li>
                  <strong>Bezorgdiensten</strong> — voor de levering van je pakket;
                </li>
                <li>
                  <strong>Resend</strong> — verzending van transactionele e-mail
                  (bestelbevestiging e.d.);
                </li>
                <li>
                  <strong>Mailchimp</strong> — verzending van de nieuwsbrief (alleen na
                  aanmelding);
                </li>
                <li>
                  <strong>Google</strong> (Tag Manager, Analytics, Ads) — analyse en advertenties,
                  uitsluitend met jouw cookietoestemming;
                </li>
                <li>
                  <strong>Vercel</strong> — hosting van de website.
                </li>
              </ul>
              <p>
                Met deze partijen sluiten we verwerkersovereenkomsten. <strong>We verkopen je
                gegevens nooit</strong> aan derden.
              </p>
            </>
          ),
        },
        {
          heading: "6. Doorgifte buiten de EER",
          body: (
            <p>
              Een deel van onze verwerkers is gevestigd in of maakt gebruik van servers buiten de
              Europese Economische Ruimte (bijvoorbeeld in de Verenigde Staten). In dat geval
              zorgen we voor passende waarborgen, zoals het EU-VS Data Privacy Framework of de
              modelcontractbepalingen (SCC&apos;s) van de Europese Commissie, zodat je gegevens
              ook daar beschermd zijn.
            </p>
          ),
        },
        {
          heading: "7. Cookies en toestemming",
          body: (
            <p>
              We plaatsen functionele cookies (altijd) en — alleen met jouw toestemming —
              analytische en marketingcookies. Je kiest dit in de cookiebanner; we werken met
              Google Consent Mode, zodat er pas gemeten en geadverteerd wordt nadat je toestemming
              hebt gegeven. Je voorkeuren wijzig je altijd via ons{" "}
              <Link href="/cookiebeleid">cookiebeleid</Link>.
            </p>
          ),
        },
        {
          heading: "8. Beveiliging",
          body: (
            <p>
              We nemen passende technische en organisatorische maatregelen om je gegevens te
              beschermen tegen verlies of onrechtmatige verwerking, waaronder versleutelde
              verbindingen (TLS/HTTPS), toegangsbeperkingen en betalingen via een gecertificeerde
              betaaldienst. Volledige betaalgegevens slaan we zelf niet op.
            </p>
          ),
        },
        {
          heading: "9. Geautomatiseerde besluitvorming en AI",
          body: (
            <p>
              We nemen geen besluiten met rechtsgevolgen of vergelijkbare ingrijpende gevolgen op
              basis van uitsluitend geautomatiseerde verwerking. Onze AI-functies (productadvies en
              klushulp) geven <strong>alleen suggesties</strong> ter ondersteuning; prijzen,
              voorraad en betalingen worden nooit automatisch aangepast.
            </p>
          ),
        },
        {
          heading: "10. Minderjarigen",
          body: (
            <p>
              Onze webshop is gericht op volwassenen. We verzamelen niet bewust gegevens van
              personen jonger dan 16 jaar zonder toestemming van een ouder of voogd. Denk je dat
              we toch zulke gegevens hebben? Neem contact op, dan verwijderen we deze.
            </p>
          ),
        },
        {
          heading: "11. Jouw rechten",
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
                Stuur je verzoek naar <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>. Ter
                bescherming kunnen we om aanvullende identificatie vragen. We reageren binnen één
                maand.
              </p>
            </>
          ),
        },
        {
          heading: "12. Klacht indienen",
          body: (
            <p>
              Ben je het niet eens met hoe we met je gegevens omgaan? Laat het ons eerst weten —
              we lossen het graag op. Je hebt ook het recht een klacht in te dienen bij de{" "}
              <a href="https://autoriteitpersoonsgegevens.nl" rel="noreferrer nofollow">
                Autoriteit Persoonsgegevens
              </a>
              .
            </p>
          ),
        },
        {
          heading: "13. Wijzigingen",
          body: (
            <p>
              We kunnen deze privacyverklaring aanpassen, bijvoorbeeld bij nieuwe diensten of
              gewijzigde regelgeving. De meest actuele versie vind je altijd op deze pagina.
              Vragen? Neem contact op met onze <Link href="/klantenservice">klantenservice</Link>.
            </p>
          ),
        },
      ]}
    />
  );
}
