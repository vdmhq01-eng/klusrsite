import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getProduct,
  allProductSlugs,
  getRelatedProducts,
  getFrequentlyBoughtTogether,
  getGlansVariants,
} from "@/lib/data/products";
import { getCategory } from "@/lib/data/categories";
import { Breadcrumb, BreadcrumbJsonLd } from "@/components/plp/breadcrumb";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductBuybox } from "@/components/product/product-buybox";
import { ProductTabs } from "@/components/product/product-tabs";
import { FrequentlyBoughtTogether } from "@/components/product/frequently-bought-together";
import { AiProductAdvice } from "@/components/product/ai-product-advice";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { ViewItemTracker } from "@/components/analytics/view-item-tracker";
import { ProductCarousel } from "@/components/shared/product-carousel";
import { SectionHeading } from "@/components/shared/section-heading";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.klus-r.nl").replace(/\/$/, "");

// Prerender a representative subset at build time; the remaining product pages
// render on demand (dynamicParams defaults to true). Keeps builds fast with the
// full ~600-product Tilroy catalogus.
export function generateStaticParams() {
  return allProductSlugs.slice(0, 60).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = getProduct(params.slug);
  if (!product) return { title: "Product niet gevonden" };

  const title = `${product.brand} ${product.title}`;
  const description =
    product.description.length > 160
      ? `${product.description.slice(0, 157).trimEnd()}…`
      : product.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: product.images.slice(0, 1),
    },
    alternates: { canonical: `/product/${product.slug}` },
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);
  if (!product) notFound();

  const glansVariants = getGlansVariants(product);
  const category = getCategory(product.category);
  const companions = getFrequentlyBoughtTogether(product);
  const alternatives = getRelatedProducts(product, 8).filter(
    (p) => !companions.some((c) => c.id === p.id),
  );

  const breadcrumbItems = [
    ...(category ? [{ label: category.title, href: `/categorie/${category.slug}` }] : []),
    ...(product.subCategory && category
      ? [
          {
            label: product.subCategory,
            href: `/categorie/${category.slug}/${product.subCategory}`,
          },
        ]
      : []),
    { label: product.title },
  ];

  const totalStock = product.stockByStore.reduce((s, x) => s + x.quantity, 0);

  // Product structured data (schema.org/Product)
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.brand} ${product.title}`,
    image: product.images,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    sku: product.id,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
    review: (product.reviews ?? []).slice(0, 3).map((r) => ({
      "@type": "Review",
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
      author: { "@type": "Person", name: r.author },
      datePublished: r.date,
      reviewBody: r.body,
    })),
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: "EUR",
      price: product.kluspasPrice.toFixed(2),
      priceValidUntil: `${new Date().getFullYear()}-12-31`,
      itemCondition: "https://schema.org/NewCondition",
      availability:
        totalStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="container-klusr pb-12">
      <ViewItemTracker product={product} />
      <Breadcrumb items={breadcrumbItems} />
      <BreadcrumbJsonLd items={breadcrumbItems} baseUrl={SITE_URL} />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      {/* Main: gallery + buybox */}
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        <ProductGallery images={product.images} title={product.title} badges={product.badges} />
        <ProductBuybox product={product} glansVariants={glansVariants} />
      </div>

      {/* Tabs */}
      <div className="mt-10">
        <ProductTabs product={product} />
      </div>

      {/* Vaak samen gekocht */}
      {companions.length > 0 && (
        <div className="mt-10">
          <FrequentlyBoughtTogether product={product} companions={companions} />
        </div>
      )}

      {/* AI advice */}
      <div className="mt-8">
        <AiProductAdvice
          productId={product.id}
          productTitle={product.title}
          category={product.category}
        />
      </div>

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <section className="mt-12">
          <SectionHeading title="Alternatieven" subtitle="Vergelijkbare producten" />
          <ProductCarousel products={alternatives} listName="Alternatieven" />
        </section>
      )}

      {/* Recently viewed */}
      <div className="mt-12">
        <RecentlyViewed currentId={product.id} />
      </div>
    </div>
  );
}
