import type { Metadata } from "next";
import { TopicImage } from "@/components/shared/topic-image";
import { articleKeywords } from "@/lib/topic-images";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock, User } from "lucide-react";
import { articles, getArticle, getRelatedArticles } from "@/lib/data";
import { ArticleCard } from "@/components/content/article-card";
import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface ArticlePageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export function generateMetadata({ params }: ArticlePageProps): Metadata {
  const article = getArticle(params.slug);
  if (!article) {
    return { title: "Artikel niet gevonden" };
  }
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      publishedTime: article.date,
      authors: [article.author],
      images: [{ url: article.image }],
    },
  };
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const article = getArticle(params.slug);
  if (!article) {
    notFound();
  }

  const related = getRelatedArticles(article, 3);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.klus-r.nl").replace(/\/$/, "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.image,
    datePublished: article.date,
    dateModified: article.date,
    articleSection: article.category,
    author: { "@type": "Organization", name: article.author },
    publisher: {
      "@type": "Organization",
      name: "KLUSR",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/advies/${article.slug}`,
    },
  };

  return (
    <article className="py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-klusr">
        {/* Breadcrumb */}
        <nav
          aria-label="Kruimelpad"
          className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground"
        >
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          <Link href="/advies" className="hover:text-primary">
            Advies
          </Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          <span className="line-clamp-1 text-foreground">{article.title}</span>
        </nav>

        {/* Header */}
        <header className="mx-auto mt-6 max-w-2xl">
          <Badge variant="muted" className="w-fit">
            {article.category}
          </Badge>
          <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-balance sm:text-4xl">
            {article.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{article.excerpt}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {article.author}
            </span>
            <span aria-hidden>·</span>
            <time dateTime={article.date}>{formatDate(article.date)}</time>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {article.readingTime} min leestijd
            </span>
          </div>
        </header>

        {/* Hero image */}
        <div className="relative mx-auto mt-8 aspect-[16/9] max-w-4xl overflow-hidden rounded-2xl">
          <TopicImage seed={article.slug} keywords={articleKeywords(article.category)} />
        </div>

        {/* Body */}
        <div className="mx-auto mt-10 max-w-2xl">
          {article.body.map((paragraph, index) => {
            const isStep = paragraph.startsWith("Stap");
            if (isStep) {
              const [lead, ...remainder] = paragraph.split(":");
              const restText = remainder.join(":").trim();
              return (
                <p
                  key={index}
                  className="mt-6 text-base leading-relaxed text-foreground first:mt-0"
                >
                  <strong className="font-bold text-foreground">
                    {lead.trim()}
                    {restText && ":"}
                  </strong>{" "}
                  {restText}
                </p>
              );
            }
            return (
              <p
                key={index}
                className="mt-6 text-base leading-relaxed text-muted-foreground first:mt-0"
              >
                {paragraph}
              </p>
            );
          })}
        </div>
      </div>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="container-klusr mt-16">
          <h2 className="mb-5 text-xl font-extrabold tracking-tight sm:text-2xl">
            Lees ook
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ArticleCard key={item.id} article={item} />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="container-klusr mt-16">
        <div className="overflow-hidden rounded-2xl bg-klusr-black p-6 text-white sm:p-10">
          <div className="grid items-center gap-6 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-black sm:text-3xl">
                Mis geen enkele klustip
              </h2>
              <p className="mt-2 text-white/70">
                Ontvang de beste stappenplannen, scherpe acties en nieuwe
                inspiratie rechtstreeks in je inbox.
              </p>
            </div>
            <NewsletterForm source="advies-artikel" />
          </div>
        </div>
      </section>
    </article>
  );
}
