import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Info } from "lucide-react";
import {
  categories,
  getCategory,
  getProductsByCategory,
  getProductsBySubCategory,
  getSubCategories,
  getSubCategory,
} from "@/lib/data";
import { Breadcrumb, BreadcrumbJsonLd } from "@/components/plp/breadcrumb";
import { ProductListing } from "@/components/plp/product-listing";
import { KlushulpFunnel } from "@/components/home/klushulp-funnel";

interface SubPageProps {
  params: { slug: string; sub: string };
}

export function generateStaticParams() {
  return categories.flatMap((c) =>
    getSubCategories(c.slug).map((sub) => ({ slug: c.slug, sub: sub.slug })),
  );
}

function resolve(params: SubPageProps["params"]) {
  const category = getCategory(params.slug);
  const subCategory = getSubCategory(params.slug, params.sub);
  return { category, subCategory };
}

export function generateMetadata({ params }: SubPageProps): Metadata {
  const { category, subCategory } = resolve(params);
  if (!category || !subCategory) {
    return { title: "Pagina niet gevonden | KLUSR" };
  }
  const title = `${subCategory.title} — ${category.title} | KLUSR`;
  const description = `${subCategory.title} kopen bij KLUSR. Onderdeel van ${category.title}. Professionele kwaliteit, scherp geprijsd en met advies van ex-schilders.`;
  return {
    title,
    description,
    alternates: { canonical: `/categorie/${category.slug}/${subCategory.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: category.image, width: 800, height: 600, alt: subCategory.title }],
    },
  };
}

export default function SubCategoryPage({ params }: SubPageProps) {
  const { category, subCategory } = resolve(params);
  if (!category || !subCategory) notFound();

  const subProducts = getProductsBySubCategory(subCategory.slug);
  const usesFallback = subProducts.length === 0;
  const products = usesFallback ? getProductsByCategory(category.slug) : subProducts;

  const breadcrumbItems = [
    { label: category.title, href: `/categorie/${category.slug}` },
    {
      label: subCategory.title,
      href: `/categorie/${category.slug}/${subCategory.slug}`,
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-12 sm:gap-10">
      <BreadcrumbJsonLd items={breadcrumbItems} />

      <div className="container-klusr">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Heading */}
      <section className="container-klusr">
        <span className="text-xs font-bold uppercase tracking-wide text-primary">
          {category.title}
        </span>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
          {subCategory.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {subCategory.title} van topmerken bij KLUSR — met deskundig advies en
          voor 16:00 besteld morgen in huis.
        </p>
      </section>

      {/* Klushulp funnel */}
      <KlushulpFunnel compact categorySlug={category.slug} />

      {/* Fallback notice when the subcategory has no dedicated products yet */}
      {usesFallback && (
        <section className="container-klusr">
          <div className="flex items-start gap-2 rounded-xl border border-border bg-secondary/60 p-4 text-sm">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-muted-foreground">
              Er zijn nog geen producten specifiek voor{" "}
              <span className="font-semibold text-foreground">
                {subCategory.title}
              </span>
              . Hieronder tonen we het volledige assortiment uit{" "}
              <span className="font-semibold text-foreground">
                {category.title}
              </span>
              .
            </p>
          </div>
        </section>
      )}

      {/* Product listing */}
      <ProductListing
        products={products}
        listName={usesFallback ? category.title : subCategory.title}
      />
    </div>
  );
}
