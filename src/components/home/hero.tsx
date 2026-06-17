import Link from "next/link";
import { ArrowRight, Sparkles, PaintRoller } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopicImage } from "@/components/shared/topic-image";
import { HeroAiCard } from "./hero-ai-card";
import { t } from "@/lib/i18n/server";

/**
 * @param heroImage Optionele, door de owner gegenereerde fal.ai-sfeerfoto
 *   (slug `home-hero`, gecachet in KV). Wordt door de homepage server-side
 *   opgehaald en hier achter de donkere gradient gelegd. Ontbreekt 'ie, dan
 *   blijft de bestaande `/generated/hero.jpg` + gradient onveranderd.
 */
export function Hero({ heroImage }: { heroImage?: string }) {
  return (
    <section className="container-klusr pt-4 sm:pt-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main hero */}
        <div className="relative overflow-hidden rounded-2xl lg:col-span-2">
          <TopicImage seed="klusr-hero-paint" keywords="house,painting,renovation" icon={PaintRoller} src="/generated/hero.jpg" />
          {/* Gegenereerd fal.ai-sfeerbeeld (indien aanwezig) bovenop de fallback,
              maar onder de donkere gradient zodat de witte tekst leesbaar blijft.
              Plain <img> i.p.v. next/image om remote-domain config te vermijden. */}
          {heroImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroImage}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-klusr-black/90 via-klusr-black/70 to-klusr-black/20" />
          <div className="relative flex min-h-[340px] flex-col justify-center gap-5 p-6 sm:min-h-[420px] sm:p-10 lg:max-w-xl">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-klusr-action" />
              {t("home.hero.badge")}
            </span>
            <h1 className="text-3xl font-black leading-[1.05] text-white text-balance sm:text-5xl">
              {t("home.hero.titleLead")}
              <span className="text-primary">{t("home.hero.titlePaint")}</span>
              {t("home.hero.titleMid")}
              <span className="text-klusr-action">{t("home.hero.titleNow")}</span>
              {t("home.hero.titleTail")}
            </h1>
            <p className="max-w-md text-sm text-white/80 sm:text-base">
              {t("home.hero.subtitle")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/categorie/verf">
                  {t("home.hero.cta")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <Link href="/klushulp">{t("home.hero.klushulp")}</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Klus-AI card */}
        <HeroAiCard />
      </div>
    </section>
  );
}
