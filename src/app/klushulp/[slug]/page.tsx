import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, MessageCircle, ShoppingBag } from "lucide-react";
import {
  klushulpTasks,
  getTask,
  getProductsByCategory,
} from "@/lib/data";
import type { Product } from "@/types";
import { Breadcrumb, BreadcrumbJsonLd } from "@/components/plp/breadcrumb";
import { CategoryIcon } from "@/components/shared/category-icon";
import { SectionHeading } from "@/components/shared/section-heading";
import { ProductGrid } from "@/components/product/product-grid";
import { ChatPanel } from "@/components/ai/chat-panel";
import { KlusadviesTracker } from "@/components/ai/klusadvies-tracker";
import { Card } from "@/components/ui/card";

/** Per-task step-by-step plans (hardcoded, written for KLUSR by ex-painters). */
const stappenplannen: Record<string, string[]> = {
  "muur-verven": [
    "Ruim de ruimte leeg en dek de vloer en plinten af met afdekfolie en afplaktape.",
    "Maak de muur schoon, vet- en stofvrij en herstel gaatjes en scheuren met muurvuller.",
    "Schuur de gevulde plekken glad en breng zo nodig een grond- of voorstrijklaag aan.",
    "Plak randen en kozijnen strak af met FrogTape voor scherpe overgangen.",
    "Breng de eerste laag muurverf aan: kruislings rollen en afrollen in één richting.",
    "Laat goed drogen en breng de tweede laag aan voor een egaal, dekkend resultaat.",
  ],
  "kozijn-schilderen": [
    "Schuur het houtwerk licht op zodat de verf goed hecht en stof de boel af.",
    "Ontvet het oppervlak en behandel kale of slechte plekken met een multiprimer.",
    "Plak het glas en de muur rondom het kozijn af met schilderstape.",
    "Breng een grondlaag aan en laat deze volgens de verpakking volledig drogen.",
    "Schuur licht tussen de lagen en stof opnieuw af voor een glad eindresultaat.",
    "Lak af met een watergedragen PU-lak met een synthetische kwast in lange halen.",
  ],
  beitsen: [
    "Controleer of het hout droog, schoon en vrij van algen of loszittende beits is.",
    "Borstel of schuur oude, bladderende beits weg en stof het oppervlak af.",
    "Behandel kale plekken eventueel met een houtbeschermer of grondbeits.",
    "Roer de beits goed door en breng een eerste dunne laag aan in de richting van de nerf.",
    "Laat de laag volledig drogen volgens de aangegeven droogtijd.",
    "Breng een tweede dunne laag aan voor optimale bescherming en een mooie kleurdiepte.",
  ],
  "vloer-leggen": [
    "Laat het laminaat of PVC minimaal 48 uur acclimatiseren in de ruimte.",
    "Controleer of de ondervloer vlak, droog en schoon is en vlak deze zo nodig uit.",
    "Leg een geschikte ondervloer met een vochtwerende folie indien nodig.",
    "Begin in een hoek met de juiste expansieruimte langs de wanden (gebruik wiggen).",
    "Klik de planken rij voor rij in elkaar en verspring de naden voor een sterk geheel.",
    "Verwijder de wiggen en monteer de plinten en eventuele afwerkprofielen.",
  ],
  "stopcontact-vervangen": [
    "Schakel de juiste groep uit in de meterkast en controleer met een spanningzoeker.",
    "Draai het oude stopcontact los en trek het voorzichtig uit de inbouwdoos.",
    "Maak een foto van de bedrading en noteer welke draad waar zit.",
    "Sluit de draden aan op het nieuwe stopcontact: fase, nul en aarde op de juiste klem.",
    "Plaats het stopcontact terug in de inbouwdoos en schroef het stevig vast.",
    "Schakel de groep weer in en test of het stopcontact veilig werkt. Twijfel je? Bel een installateur.",
  ],
  "tuin-opknappen": [
    "Maak een plan: welke onderdelen wil je reinigen, beitsen of vervangen?",
    "Reinig bestrating, schutting en tuinmeubels met een geschikte reiniger.",
    "Laat houtwerk goed drogen en herstel of vervang kapotte delen.",
    "Beits of olie de schutting en het tuinhout voor langdurige bescherming.",
    "Behandel onkruid tussen de bestrating en vul voegen waar nodig aan.",
    "Rond af met de finishing touch: verlichting, planten of nieuwe accessoires.",
  ],
};

const chatSuggestionsByTask: Record<string, string[]> = {
  "muur-verven": [
    "Hoeveel liter verf heb ik nodig voor 20 m²?",
    "Welke roller kan ik het beste gebruiken?",
    "Moet ik eerst gronden?",
  ],
  "kozijn-schilderen": [
    "Welke lak is het beste voor buitenkozijnen?",
    "Hoe voorkom ik kwaststrepen?",
    "Welke primer heb ik nodig op kaal hout?",
  ],
  beitsen: [
    "Transparante of dekkende beits — wat kies ik?",
    "Hoeveel lagen beits heb ik nodig?",
    "Kan ik beitsen bij vochtig weer?",
  ],
  "vloer-leggen": [
    "Welke ondervloer past bij mijn situatie?",
    "Hoeveel expansieruimte moet ik aanhouden?",
    "Welk gereedschap heb ik nodig om laminaat te leggen?",
  ],
  "stopcontact-vervangen": [
    "Hoe maak ik een groep veilig spanningsvrij?",
    "Welke draad is de fase?",
    "Wanneer schakel ik beter een installateur in?",
  ],
  "tuin-opknappen": [
    "Hoe reinig ik mijn bestrating het beste?",
    "Welke beits is geschikt voor een schutting?",
    "Hoe bescherm ik tuinhout tegen weer en wind?",
  ],
};

export function generateStaticParams() {
  return klushulpTasks.map((task) => ({ slug: task.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const task = getTask(params.slug);
  if (!task) {
    return { title: "Klushulp niet gevonden" };
  }
  return {
    title: `${task.title} — stappenplan & benodigdheden`,
    description: `${task.description} Volg het stappenplan van de KLUSR ex-schilders en shop direct de juiste producten voor ${task.title.toLowerCase()}.`,
    openGraph: {
      title: `${task.title} — klushulp | KLUSR`,
      description: task.description,
    },
  };
}

/** Gather, dedupe and limit products for a task's related categories. */
function getTaskProducts(relatedCategories: string[], limit = 8): Product[] {
  const seen = new Set<string>();
  const result: Product[] = [];
  for (const slug of relatedCategories) {
    for (const product of getProductsByCategory(slug)) {
      if (seen.has(product.id)) continue;
      seen.add(product.id);
      result.push(product);
      if (result.length >= limit) return result;
    }
  }
  return result;
}

export default function KlushulpDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const task = getTask(params.slug);
  if (!task) notFound();

  const steps = stappenplannen[task.slug] ?? [];
  const products = getTaskProducts(task.relatedCategories, 8);
  const suggestions = chatSuggestionsByTask[task.slug];

  const crumbs = [
    { label: "Klushulp", href: "/klushulp" },
    { label: task.title },
  ];

  return (
    <div className="py-2 sm:py-4">
      <div className="container-klusr">
        <Breadcrumb items={crumbs} />
        <BreadcrumbJsonLd items={crumbs} />
      </div>

      {/* Hero */}
      <section className="container-klusr mt-2">
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-card sm:flex-row sm:items-center sm:gap-6 sm:p-8">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
            <CategoryIcon name={task.icon} className="h-8 w-8" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
              Klushulp
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
              {task.title}
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {task.description}
            </p>
          </div>
        </div>
      </section>

      {/* Main content: stappenplan + assistant */}
      <section className="container-klusr mt-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Stappenplan */}
          <div>
            <SectionHeading
              title="Stappenplan"
              subtitle={`Zo pak je "${task.title.toLowerCase()}" stap voor stap aan`}
            />
            <ol className="flex flex-col gap-4">
              {steps.map((step, index) => (
                <li
                  key={index}
                  className="flex gap-4 rounded-xl border border-border bg-card p-4"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm leading-relaxed text-foreground">
                    {step}
                  </p>
                </li>
              ))}
            </ol>

            <div className="mt-6">
              <KlusadviesTracker task={task.slug} />
            </div>
          </div>

          {/* Embedded assistant */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Card className="flex min-h-[460px] flex-col overflow-hidden">
              <div className="flex items-center gap-2 bg-gradient-to-br from-primary to-klusr-red-dark px-4 py-3 text-white">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/15">
                  <MessageCircle className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold leading-tight">
                    Vraag het de KLUSR-assistent
                  </p>
                  <p className="text-[11px] text-white/70">
                    Persoonlijk advies voor {task.title.toLowerCase()}
                  </p>
                </div>
              </div>
              <ChatPanel
                className="flex-1"
                context={`Klushulp voor de klus "${task.title}". ${task.description} De gebruiker bekijkt het stappenplan en wil advies over de aanpak, het juiste gereedschap en de beste verf/materialen voor deze specifieke klus.`}
                suggestions={suggestions}
                initialAssistantMessage={`Hoi! Ik help je graag met ${task.title.toLowerCase()}. Wat wil je weten?`}
              />
            </Card>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="container-klusr mt-12 sm:mt-16">
        <SectionHeading
          title="Wat heb je nodig"
          subtitle="De juiste producten voor deze klus, geselecteerd door onze experts"
        />
        {products.length > 0 ? (
          <ProductGrid products={products} listName={`Klushulp · ${task.title}`} />
        ) : (
          <Card className="flex flex-col items-center gap-3 p-8 text-center">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Er zijn nog geen gekoppelde producten voor deze klus. Vraag de
              KLUSR-assistent om een passend advies.
            </p>
          </Card>
        )}

        <div className="mt-6">
          <Link
            href="/klushulp"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            Bekijk alle klussen
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
