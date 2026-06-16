import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { categories, searchProducts } from "@/lib/data";
import { Breadcrumb } from "@/components/plp/breadcrumb";
import { ProductListing } from "@/components/plp/product-listing";
import { CategoryIcon } from "@/components/shared/category-icon";
import { Button } from "@/components/ui/button";

interface SearchPageProps {
  searchParams: { q?: string | string[] };
}

export const metadata: Metadata = {
  title: "Zoeken | KLUSR",
  description: "Zoek in het volledige assortiment van KLUSR.",
  // Search result pages should not be indexed.
  robots: { index: false, follow: true },
};

function getQuery(searchParams: SearchPageProps["searchParams"]): string {
  const raw = searchParams.q;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return (value ?? "").trim();
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = getQuery(searchParams);
  const results = query ? searchProducts(query, 240) : [];
  const hasQuery = query.length > 0;
  const hasResults = results.length > 0;

  // Categories worth surfacing as suggestions (skip the "acties" meta-category).
  const suggested = categories.filter((c) => c.slug !== "acties").slice(0, 8);

  return (
    <div className="flex flex-col gap-8 pb-12 sm:gap-10">
      <div className="container-klusr">
        <Breadcrumb items={[{ label: "Zoeken" }]} />
      </div>

      {/* Search header */}
      <section className="container-klusr">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          {hasQuery ? (
            <>
              Zoekresultaten voor{" "}
              <span className="text-primary">&ldquo;{query}&rdquo;</span>
            </>
          ) : (
            "Zoeken"
          )}
        </h1>

        <form
          action="/zoeken"
          method="get"
          role="search"
          className="mt-4 flex max-w-2xl items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Zoek op product, merk of klus…"
              aria-label="Zoekterm"
              autoComplete="off"
              className="h-11 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button type="submit" size="lg">
            Zoeken
          </Button>
        </form>

        {hasQuery && (
          <p className="mt-3 text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{results.length}</span>{" "}
            {results.length === 1 ? "resultaat" : "resultaten"} gevonden
          </p>
        )}
      </section>

      {/* Results or empty state */}
      {hasResults ? (
        <ProductListing products={results} listName={`Zoekresultaten: ${query}`} />
      ) : (
        <section className="container-klusr">
          <div className="rounded-2xl border border-border bg-card p-6 text-center sm:p-10">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
              <Search className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-lg font-extrabold sm:text-xl">
              {hasQuery
                ? `Geen resultaten voor "${query}"`
                : "Waar ben je naar op zoek?"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              {hasQuery
                ? "Controleer de spelling of probeer een andere zoekterm. Of blader door onze populaire categorieën hieronder."
                : "Typ hierboven een product, merk of klus. Of kies direct een van onze categorieën."}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 text-left sm:grid-cols-4">
              {suggested.map((category) => (
                <Link
                  key={category.slug}
                  href={`/categorie/${category.slug}`}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <CategoryIcon name={category.icon} className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold leading-tight">
                    {category.title}
                  </span>
                </Link>
              ))}
            </div>

            <Button asChild variant="outline" className="mt-6">
              <Link href="/categorie/acties">Bekijk alle acties</Link>
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
