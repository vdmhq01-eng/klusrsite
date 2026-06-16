import type { Metadata } from "next";
import { TopicImage } from "@/components/shared/topic-image";
import { articleKeywords } from "@/lib/topic-images";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight, Clock, User } from "lucide-react";
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

  const faqJsonLd =
    article.faq && article.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: article.faq.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null;

  return (
    <article className="py-8">
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
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

        {/* Interne links — direct naar de juiste producten/categorieën */}
        {article.relatedLinks && article.relatedLinks.length > 0 && (
          <aside className="mx-auto mt-10 max-w-2xl rounded-2xl border border-border bg-secondary/40 p-6">
            <h2 className="text-lg font-extrabold tracking-tight">Direct aan de slag</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Alles wat je voor deze klus nodig hebt, vind je hier:
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {article.relatedLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-semibold transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    {link.label}
                    <ArrowRight className="h-4 w-4 shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}

        {/* Veelgestelde vragen — rendert + FAQPage structured data */}
        {article.faq && article.faq.length > 0 && (
          <section className="mx-auto mt-12 max-w-2xl">
            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              Veelgestelde vragen
            </h2>
            <dl className="mt-5 divide-y divide-border border-y border-border">
              {article.faq.map((f, i) => (
                <div key={i} className="py-4">
                  <dt className="font-bold text-foreground">{f.question}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {f.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}
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
