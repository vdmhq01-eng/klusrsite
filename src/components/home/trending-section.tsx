import { getTrendingTheme } from "@/lib/trending";
import { getProductsByCategory } from "@/lib/data/products";
import { SectionHeading } from "@/components/shared/section-heading";
import { ProductCarousel } from "@/components/shared/product-carousel";

/**
 * Trending-sectie die automatisch meebeweegt met seizoen en feestdagen
 * (zie src/lib/trending.ts). Server-component: kiest het thema op de serverdatum.
 */
export function TrendingSection() {
  const theme = getTrendingTheme();
  const products = getProductsByCategory(theme.categorySlug).slice(0, 10);
  if (products.length === 0) return null;

  return (
    <section className="container-klusr">
      <SectionHeading
        title={theme.title}
        subtitle={theme.subtitle}
        href={theme.href}
        linkLabel="Bekijk alles"
      />
      <ProductCarousel products={products} listName={`Trending — ${theme.key}`} />
    </section>
  );
}
