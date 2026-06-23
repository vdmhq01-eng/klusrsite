import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TopicImage } from "@/components/shared/topic-image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  ChevronRight,
  Clock,
  User,
  Paintbrush,
  Wrench,
  Palette,
  TreePine,
  Home,
  Zap,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { articles, getArticle, getRelatedArticles } from "@/lib/data";
import { getProductsByCategory } from "@/lib/data/products";
import { ArticleCard } from "@/components/content/article-card";
import { ProductCard } from "@/components/product/product-card";
import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface ArticlePageProps {
  params: { slug: string };
}

/** Artikel-categorie → productcategorie-slug voor de "Aanbevolen producten"-sectie. */
const PRODUCT_CATEGORY_BY_ARTICLE: Record<string, string> = {
  Verven: "verf",
  Gereedschap: "gereedschap",
  Inspiratie: "verf",
  Tuin: "verf",
  Buiten: "verf",
  Elektra: "elektra",
  Vloeren: "vloeren-raam",
};

/** Categorie → Lucide-icoon voor het on-brand hero-beeld (fallback achter de foto). */
const CATEGORY_ICON: Record<string, LucideIcon> = {
  Verven: Paintbrush,
  Gereedschap: Wrench,
  Inspiratie: Palette,
  Tuin: TreePine,
  Buiten: Home,
  Elektra: Zap,
  Vloeren: Layers,
};

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export function generateMetadata({ params }: ArticlePageProps): Metadata {
  const article = getArticle(params.slug);
  if (!article) {
    return { title: "Artikel niet gevonden" };
  }
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.klus-r.nl").replace(/\/$/, "");
  const heroUrl = `${base}/generated/blog/${article.slug}.jpg`;
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/advies/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      publishedTime: article.date,
      authors: [article.author],
      images: [{ url: heroUrl }],
    },
  };
}

/**
 * Zet de platte body-array om in een rijke, SEO-vriendelijke opbouw:
 *  - "## "  → H2-kop, "### " → H3-kop (koppenhiërarchie voor SEO)
 *  - "- "   → opsommingstekens (opeenvolgende regels worden één lijst)
 *  - "Stap N — …" → vetgedrukte stap-lead
 *  - overige regels → gewone alinea
 */
function renderArticleBody(body: string[]): ReactNode[] {
  const blocks: ReactNode[] = [];
  let list: string[] = [];

  const flushList = (key: string) => {
    if (list.length === 0) return;
    const items = [...list];
    list = [];
    blocks.push(
      <ul
        key={key}
        className="mt-4 list-disc space-y-1.5 pl-5 text-base leading-relaxed text-muted-foreground"
      >
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>,
    );
  };

  body.forEach((raw, index) => {
    const line = raw.trim();

    if (line.startsWith("- ")) {
      list.push(line.slice(2).trim());
      return;
    }
    flushList(`list-${index}`);

    if (line.startsWith("### ")) {
      blocks.push(
        <h3 key={index} className="mt-8 text-lg font-extrabold tracking-tight text-foreground">
          {line.slice(4).trim()}
        </h3>,
      );
      return;
    }
    if (line.startsWith("## ")) {
      blocks.push(
        <h2
          key={index}
          className="mt-10 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl"
        >
          {line.slice(3).trim()}
        </h2>,
      );
      return;
    }
    if (line.startsWith("Stap")) {
      const [lead, ...remainder] = line.split(":");
      const restText = remainder.join(":").trim();
      blocks.push(
        <p key={index} className="mt-6 text-base leading-relaxed text-foreground first:mt-0">
          <strong className="font-bold text-foreground">
            {lead.trim()}
            {restText && ":"}
          </strong>{" "}
          {restText}
        </p>,
      );
      return;
    }
    blocks.push(
      <p key={index} className="mt-6 text-base leading-relaxed text-muted-foreground first:mt-0">
        {line}
      </p>,
    );
  });

  flushList("list-end");
  return blocks;
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const article = getArticle(params.slug);
  if (!article) {
    notFound();
  }

  const related = getRelatedArticles(article, 3);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.klus-r.nl").replace(/\/$/, "");
  // Pre-gegenereerde fal.ai-hero (public/generated/blog/<slug>.jpg). Bestaat die
  // (nog) niet, dan valt TopicImage netjes terug op de on-brand BrandedVisual.
  const heroSrc = `/generated/blog/${article.slug}.jpg`;
  const heroUrl = `${siteUrl}${heroSrc}`;
  const heroIcon = CATEGORY_ICON[article.category];
  const productCategory = PRODUCT_CATEGORY_BY_ARTICLE[article.category];
  const featuredProducts = productCategory
    ? getProductsByCategory(productCategory).slice(0, 3)
    : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: heroUrl,
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

        {/* Hero — pre-gegenereerde fal.ai-foto, met on-brand BrandedVisual als fallback */}
        <div className="group relative mx-auto mt-8 aspect-[16/9] max-w-4xl overflow-hidden rounded-2xl">
          <TopicImage seed={article.slug} src={heroSrc} icon={heroIcon} alt={article.title} />
        </div>

        {/* Body */}
        <div className="mx-auto mt-10 max-w-2xl">{renderArticleBody(article.body)}</div>

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

        {/* Aanbevolen producten — echte productkaarten (conversie + interne SEO-links) */}
        {featuredProducts.length > 0 && (
          <section className="mx-auto mt-12 max-w-4xl">
            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              Aanbevolen producten voor deze klus
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Direct het juiste materiaal in huis — met KLUSRPAS-voordeel.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} listName="Advies-artikel" />
              ))}
            </div>
          </section>
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
