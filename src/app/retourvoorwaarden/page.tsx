import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, COMPANY } from "@/components/shared/legal-page";

export const metadata: Metadata = {
  title: "Retourvoorwaarden | KLUSR",
  description:
    "Retourvoorwaarden van KLUSR: 14 dagen bedenktijd, gratis retourneren (ook in de winkel), terugbetaling en uitzonderingen zoals op kleur gemengde verf.",
  alternates: { canonical: "/retourvoorwaarden" },
};

export default function RetourvoorwaardenPage() {
  return (
    <LegalPage
      title="Retourvoorwaarden"
      updated="16 juni 2026"
      intro="Niet helemaal tevreden of toch verkeerd besteld? Geen probleem. Je hebt 14 dagen bedenktijd en retourneren is gratis — online of in een KLUSR-winkel."
      sections={[
        {
          heading: "1. 14 dagen bedenktijd",
          body: (
            <p>
              Als consument mag je je bestelling binnen <strong>14 dagen</strong> na ontvangst
              zonder opgave van reden herroepen. Tijdens deze bedenktijd ga je zorgvuldig om met
              het product en de verpakking: je mag het product beoordelen zoals je dat in een
              winkel zou doen, maar niet (verder) gebruiken.
            </p>
          ),
        },
        {
          heading: "2. Gratis retourneren",
          body: (
            <p>
              Retourneren is <strong>gratis</strong>. Je kunt je product terugsturen óf gratis
              inleveren in een van onze <Link href="/winkels">KLUSR-winkels</Link>. Bewaar je
              bewijs van verzending tot de terugbetaling rond is.
            </p>
          ),
        },
        {
          heading: "3. Zo meld je je retour aan",
          body: (
            <p>
              Meld je retour binnen de bedenktijd aan via{" "}
              <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> onder vermelding van je
              bestelnummer, of kom langs in de winkel. Je ontvangt dan de retourinstructies. Je
              mag hiervoor ook het modelformulier voor herroeping (onderaan) gebruiken.
            </p>
          ),
        },
        {
          heading: "4. Het product terugsturen",
          body: (
            <p>
              Stuur het product compleet en, indien redelijkerwijs mogelijk, in de originele staat
              en verpakking retour. Doe dit binnen 14 dagen nadat je je retour hebt gemeld. Een
              waardevermindering door gebruik dat verder gaat dan nodig om het product te
              beoordelen, kan worden verrekend met de terugbetaling.
            </p>
          ),
        },
        {
          heading: "5. Terugbetaling",
          body: (
            <p>
              We betalen het volledige aankoopbedrag (inclusief de standaard verzendkosten van de
              heenzending) binnen <strong>14 dagen</strong> terug, nadat we je retour hebben
              ontvangen of je hebt aangetoond dat je het product hebt teruggestuurd. Terugbetaling
              gebeurt met hetzelfde betaalmiddel als waarmee je hebt betaald, tenzij anders
              afgesproken.
            </p>
          ),
        },
        {
          heading: "6. Uitzonderingen op het retourrecht",
          body: (
            <>
              <p>Het herroepingsrecht geldt niet voor onder meer:</p>
              <ul>
                <li>
                  <strong>op kleur gemengde verf</strong> en andere op maat gemaakte of
                  gepersonaliseerde producten;
                </li>
                <li>producten die door hun aard niet kunnen worden teruggezonden;</li>
                <li>
                  verzegelde producten die om redenen van gezondheid of hygiëne niet geschikt zijn
                  voor retour en waarvan de verzegeling na levering is verbroken.
                </li>
              </ul>
              <p>
                Deze uitzonderingen gelden niet als het product gebrekkig is — zie hieronder.
              </p>
            </>
          ),
        },
        {
          heading: "7. Beschadigd of verkeerd geleverd",
          body: (
            <p>
              Is je product beschadigd, defect of heb je iets anders ontvangen dan besteld? Neem
              dan zo snel mogelijk contact op via{" "}
              <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> of{" "}
              {COMPANY.phone}. We lossen het kosteloos voor je op met een vervangend product of een
              terugbetaling. Je wettelijke (conformiteits)rechten blijven altijd gelden.
            </p>
          ),
        },
        {
          heading: "8. Modelformulier voor herroeping",
          body: (
            <p>
              Aan — {COMPANY.legalName}, {COMPANY.address}, {COMPANY.email}:
              <br />
              Ik/Wij* deel/delen* u hierbij mede dat ik/wij* onze overeenkomst betreffende de
              verkoop van de volgende producten herroep/herroepen*: [productomschrijving].
              Besteld op*/ontvangen op* [datum]. [Naam], [adres], [datum]. (* Doorhalen wat niet
              van toepassing is.)
            </p>
          ),
        },
        {
          heading: "Vragen?",
          body: (
            <p>
              Onze <Link href="/klantenservice">klantenservice</Link> helpt je graag. Zie ook onze{" "}
              <Link href="/voorwaarden">algemene voorwaarden</Link> voor het volledige
              herroepingsrecht.
            </p>
          ),
        },
      ]}
    />
  );
}
