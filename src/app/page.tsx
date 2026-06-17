import { Hero } from "@/components/home/hero";
import { KlushulpFunnel } from "@/components/home/klushulp-funnel";
import { VerfCategories } from "@/components/home/verf-categories";
import { TrendingSection } from "@/components/home/trending-section";
import { ForYouSection } from "@/components/home/for-you-section";
import { CategoryTiles } from "@/components/home/category-tiles";
import { KluspasBanner } from "@/components/home/kluspas-banner";
import { InspirationSection } from "@/components/home/inspiration-section";
import { SectionHeading } from "@/components/shared/section-heading";
import { ProductCarousel } from "@/components/shared/product-carousel";
import { ViewItemListTracker } from "@/components/analytics/view-item-list-tracker";
import { getBestsellers, getActieProducts } from "@/lib/data/products";
import { getHeroImage } from "@/lib/store/hero";

// De homepage-banner kan een door de owner gegenereerd sfeerbeeld tonen (KV);
// haal 'm bij elk bezoek op zodat een nieuw beeld direct verschijnt.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const bestsellers = getBestsellers(8);
  const acties = getActieProducts(8);

  // Door de owner gegenereerde fal.ai-banner (gecachet in KV). Ontbreekt 'ie of
  // is KV uit, dan valt <Hero> terug op /generated/hero.jpg + de gradient.
  const heroImage = await getHeroImage("home-hero");

  return (
    <div className="flex flex-col gap-10 py-6 sm:gap-12">
      <Hero heroImage={heroImage} />

      <KlushulpFunnel />

      <VerfCategories />

      {/* Persoonlijke aanbevelingen voor terugkerende klanten (verborgen voor nieuwe bezoekers) */}
      <ForYouSection />

      <TrendingSection />

      {/* Populaire producten */}
      <section className="container-klusr">
        <SectionHeading
          title="Populaire producten"
          subtitle="De favorieten van onze klussers"
          href="/categorie/verf"
          linkLabel="Meer producten"
        />
        <ViewItemListTracker products={bestsellers} listName="Populaire producten" />
        <ProductCarousel products={bestsellers} listName="Populaire producten" />
      </section>

      <KluspasBanner />

      {/* Acties */}
      <section className="container-klusr">
        <SectionHeading
          title="Acties & aanbiedingen"
          subtitle="Tijdelijk extra voordeel"
          href="/categorie/acties"
        />
        <ProductCarousel products={acties} listName="Acties" />
      </section>

      <CategoryTiles />

      <InspirationSection />
    </div>
  );
}
