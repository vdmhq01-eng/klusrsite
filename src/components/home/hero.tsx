import Link from "next/link";
import { ArrowRight, Sparkles, PaintRoller } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopicImage } from "@/components/shared/topic-image";
import { HeroAiCard } from "./hero-ai-card";

export function Hero() {
  return (
    <section className="container-klusr pt-4 sm:pt-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main hero */}
        <div className="relative overflow-hidden rounded-2xl lg:col-span-2">
          <TopicImage seed="klusr-hero-paint" keywords="house,painting,renovation" icon={PaintRoller} src="/generated/hero.jpg" />
          <div className="absolute inset-0 bg-gradient-to-r from-klusr-black/90 via-klusr-black/70 to-klusr-black/20" />
          <div className="relative flex min-h-[340px] flex-col justify-center gap-5 p-6 sm:min-h-[420px] sm:p-10 lg:max-w-xl">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-klusr-action" />
              Advies van ex-schilders
            </span>
            <h1 className="text-3xl font-black leading-[1.05] text-white text-balance sm:text-5xl">
              De beste <span className="text-primary">VERF</span> en alles wat je{" "}
              <span className="text-klusr-action">NÚ</span> nodig hebt voor de klus!
            </h1>
            <p className="max-w-md text-sm text-white/80 sm:text-base">
              Professionele kwaliteit, op kleur gemengd. Van binnen- en buitenverf tot
              gereedschap, ijzerwaren en elektra.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/categorie/verf">
                  Bekijk ons assortiment
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <Link href="/klushulp">Klushulp</Link>
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
