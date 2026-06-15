import { articles } from "@/lib/data/articles";
import { SectionHeading } from "@/components/shared/section-heading";
import { ArticleCard } from "@/components/content/article-card";

export function InspirationSection() {
  return (
    <section className="container-klusr">
      <SectionHeading
        title="Inspiratie & advies"
        subtitle="Klustips en stappenplannen van onze experts"
        href="/advies"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.slice(0, 3).map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
