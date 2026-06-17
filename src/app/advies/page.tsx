import type { Metadata } from "next";
import { TopicImage } from "@/components/shared/topic-image";
import { articleKeywords } from "@/lib/topic-images";
import Link from "next/link";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { articles } from "@/lib/data";
import { listBlogPosts } from "@/lib/store/blog";
import { ArticleFilter } from "@/components/content/article-filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

// Verse AI-blogs komen uit KV; haal ze bij elk bezoek op.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Advies & inspiratie",
  description:
    "Klustips, stappenplannen en inspiratie van de KLUSR-experts. Van muur verven tot het juiste gereedschap kiezen — zo klus je als een pro.",
  openGraph: {
    title: "Advies & inspiratie | KLUSR",
    description:
      "Klustips, stappenplannen en inspiratie van de KLUSR-experts. Zo klus je als een pro.",
  },
};

export default async function AdviesPage() {
  const [featured, ...rest] = articles;
  const blogPosts = await listBlogPosts(6);

  return (
    <div className="flex flex-col gap-12 py-8 sm:gap-16">
      {/* Hero */}
      <section className="container-klusr">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">
          Advies & inspiratie
        </p>
        <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-tight text-balance sm:text-4xl lg:text-5xl">
          Klus als een pro met advies van onze experts
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Stappenplannen, praktische klustips en inspiratie — geschreven door
          ex-schilders en doe-het-zelvers. Vind precies wat je nodig hebt voor
          jouw volgende klus.
        </p>
      </section>

      {/* Featured article */}
      {featured && (
        <section className="container-klusr">
          <Link
            href={`/advies/${featured.slug}`}
            className="group grid overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-shadow hover:shadow-card-hover lg:grid-cols-2"
          >
            <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto">
              <TopicImage seed={featured.slug} keywords={articleKeywords(featured.category)} />
              <Badge className="absolute left-4 top-4">Uitgelicht</Badge>
            </div>
            <div className="flex flex-col justify-center gap-4 p-6 sm:p-10">
              <Badge variant="muted" className="w-fit">
                {featured.category}
              </Badge>
              <h2 className="text-2xl font-black leading-tight tracking-tight group-hover:text-primary sm:text-3xl">
                {featured.title}
              </h2>
              <p className="text-muted-foreground">{featured.excerpt}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>{featured.author}</span>
                <span aria-hidden>·</span>
                <span>{formatDate(featured.date)}</span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {featured.readingTime} min leestijd
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 pt-1 text-sm font-semibold text-primary">
                Lees het artikel
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        </section>
      )}

      {/* All articles, filterable */}
      <section className="container-klusr">
        <h2 className="mb-5 text-xl font-extrabold tracking-tight sm:text-2xl">
          Alle artikelen
        </h2>
        <ArticleFilter articles={rest} />
      </section>

      {/* Vers van de Klus-AI — automatisch gegenereerde blogs */}
      {blogPosts.length > 0 && (
        <section className="container-klusr">
          <div className="mb-5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
Vers van de werkplaats
            </span>
            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              Nieuwe klustips
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/advies/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-shadow hover:shadow-card-hover"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <TopicImage seed={post.slug} keywords="painting,wall,roller" />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="muted" className="w-fit">
                      {post.category}
                    </Badge>
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                  </div>
                  <h3 className="font-extrabold leading-tight tracking-tight group-hover:text-primary">
                    {post.title}
                  </h3>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {post.excerpt}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-primary">
                    Lees de blog
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* AI klushulp CTA */}
      <section className="container-klusr">
        <div className="overflow-hidden rounded-2xl bg-klusr-black text-white">
          <div className="grid items-center gap-6 p-6 sm:p-10 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold">
                <Sparkles className="h-3.5 w-3.5" />
                AI KLUSHULP
              </span>
              <h2 className="mt-4 text-2xl font-black sm:text-3xl">
                Niet zeker waar je moet beginnen?
              </h2>
              <p className="mt-2 max-w-xl text-white/70">
                Beschrijf je klus en onze AI klushulp stelt direct het juiste
                stappenplan, gereedschap en de juiste verf voor. Gratis en
                zonder gedoe.
              </p>
            </div>
            <div className="flex lg:justify-end">
              <Button asChild size="lg">
                <Link href="/klushulp">
                  Start de klushulp
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
