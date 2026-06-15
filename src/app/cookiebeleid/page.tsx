import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/shared/legal-page";

export const metadata: Metadata = {
  title: "Cookiebeleid | KLUSR",
  description:
    "Welke cookies KLUSR gebruikt (functioneel, analytisch en marketing), waarvoor, en hoe je je voorkeuren beheert.",
  alternates: { canonical: "/cookiebeleid" },
};

export default function CookiebeleidPage() {
  return (
    <LegalPage
      title="Cookiebeleid"
      updated="15 juni 2026"
      intro="KLUSR gebruikt cookies en vergelijkbare technieken om de website te laten werken, te analyseren en te verbeteren. Hieronder lees je welke soorten we gebruiken en hoe je je voorkeuren beheert."
      sections={[
        {
          heading: "1. Wat zijn cookies?",
          body: (
            <p>
              Cookies zijn kleine tekstbestanden die bij een bezoek aan de website op je apparaat
              worden geplaatst. Ze onthouden bijvoorbeeld je winkelwagen of helpen ons begrijpen
              hoe de website wordt gebruikt.
            </p>
          ),
        },
        {
          heading: "2. Welke cookies gebruiken we?",
          body: (
            <ul>
              <li>
                <strong>Functionele cookies</strong> — noodzakelijk om de website te laten werken,
                zoals je winkelwagen, inlogsessie en cookievoorkeuren. Hiervoor is geen
                toestemming nodig.
              </li>
              <li>
                <strong>Analytische cookies</strong> — om geanonimiseerd te meten hoe de website
                wordt gebruikt, zodat we deze kunnen verbeteren (o.a. via Google Tag Manager).
              </li>
              <li>
                <strong>Marketingcookies</strong> — om aanbiedingen relevanter te maken en het
                effect van campagnes te meten. Deze plaatsen we alleen met jouw toestemming.
              </li>
            </ul>
          ),
        },
        {
          heading: "3. Toestemming en beheer",
          body: (
            <p>
              Bij je eerste bezoek vragen we toestemming voor niet-functionele cookies. Je kunt je
              keuze altijd aanpassen of intrekken via de cookie-instellingen onderaan de website
              of door de cookies in je browser te verwijderen.
            </p>
          ),
        },
        {
          heading: "4. Cookies van derden",
          body: (
            <p>
              Sommige cookies worden geplaatst door derden, zoals onze analyse- en
              betaaldienstverleners. Op hun verwerking is mede hun eigen privacy- en cookiebeleid
              van toepassing. Lees ook onze <Link href="/privacy">privacyverklaring</Link>.
            </p>
          ),
        },
        {
          heading: "5. Cookies uitschakelen",
          body: (
            <p>
              Je kunt cookies weigeren of verwijderen via de instellingen van je browser. Houd er
              rekening mee dat de website dan mogelijk niet volledig werkt — functionele cookies
              zijn nodig voor onder andere je winkelwagen en het afrekenen.
            </p>
          ),
        },
        {
          heading: "6. Wijzigingen",
          body: (
            <p>
              We kunnen dit cookiebeleid aanpassen wanneer onze website of regelgeving verandert.
              De actuele versie staat altijd op deze pagina.
            </p>
          ),
        },
      ]}
    />
  );
}
