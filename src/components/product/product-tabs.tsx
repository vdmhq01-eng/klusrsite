import { Check, Sparkles } from "lucide-react";
import type { Product } from "@/types";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { StarRating } from "./star-rating";
import { formatDate } from "@/lib/utils";
import { getProductReviews } from "@/lib/reviews";
import { t } from "@/lib/i18n/server";

export function ProductTabs({ product }: { product: Product }) {
  const reviews = getProductReviews(product);
  return (
    <Tabs defaultValue="omschrijving" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="omschrijving">{t("pdp.tab.description")}</TabsTrigger>
        <TabsTrigger value="specificaties">{t("pdp.tab.specs")}</TabsTrigger>
        <TabsTrigger value="reviews">{t("pdp.tab.reviews")} ({product.reviewCount})</TabsTrigger>
        {product.faqs && product.faqs.length > 0 && (
          <TabsTrigger value="faq">{t("faq.title")}</TabsTrigger>
        )}
        {product.processingAdvice && (
          <TabsTrigger value="verwerking">{t("pdp.tab.processing")}</TabsTrigger>
        )}
      </TabsList>

      {/* Omschrijving */}
      <TabsContent value="omschrijving">
        <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>{product.description}</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {product.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2 text-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-klusr-stock" strokeWidth={3} />
                {h}
              </li>
            ))}
          </ul>
        </div>
      </TabsContent>

      {/* Specificaties */}
      <TabsContent value="specificaties">
        <div className="max-w-2xl space-y-6">
          {product.specifications.map((group) => (
            <div key={group.group}>
              <h4 className="mb-2 text-sm font-bold">{group.group}</h4>
              <dl className="overflow-hidden rounded-lg border border-border">
                {group.items.map((item, i) => (
                  <div
                    key={item.label}
                    className={i % 2 === 0 ? "flex bg-secondary/40" : "flex bg-card"}
                  >
                    <dt className="w-1/2 px-3 py-2 text-sm text-muted-foreground">
                      {item.label}
                    </dt>
                    <dd className="w-1/2 px-3 py-2 text-sm font-medium">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </TabsContent>

      {/* Reviews */}
      <TabsContent value="reviews">
        <div id="reviews" className="max-w-2xl">
          <div className="mb-5 flex items-center gap-4 rounded-lg border border-border bg-card p-4">
            <div className="text-center">
              <p className="text-3xl font-black">{product.rating.toFixed(1)}</p>
              <StarRating rating={product.rating} showCount={false} />
            </div>
            <div className="text-sm text-muted-foreground">
              {t("pdp.reviews.basedOnPre")}<strong className="text-foreground">{product.reviewCount}</strong>{t("pdp.reviews.basedOnPost")}
            </div>
          </div>
          <ul className="space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="border-b border-border pb-4 last:border-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StarRating rating={r.rating} size="sm" showCount={false} />
                    {r.title && <span className="text-sm font-semibold">{r.title}</span>}
                  </div>
                  {r.verified && (
                    <span className="inline-flex items-center gap-1 text-xs text-klusr-stock">
                      <Check className="h-3 w-3" strokeWidth={3} /> {t("pdp.reviews.verified")}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">{r.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {r.author} · {formatDate(r.date)}
                </p>
              </li>
            ))}
            {reviews.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("pdp.reviews.none")}</p>
            )}
          </ul>
        </div>
      </TabsContent>

      {/* FAQ */}
      {product.faqs && product.faqs.length > 0 && (
        <TabsContent value="faq">
          <Accordion type="single" collapsible className="max-w-2xl">
            {product.faqs.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger>{f.question}</AccordionTrigger>
                <AccordionContent>{f.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
      )}

      {/* Verwerking & advies */}
      {product.processingAdvice && (
        <TabsContent value="verwerking">
          <div className="max-w-2xl rounded-lg border border-border bg-secondary/30 p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-bold">
              <Sparkles className="h-4 w-4 text-primary" />
              {t("pdp.processing.title")}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {product.processingAdvice}
            </p>
          </div>
        </TabsContent>
      )}
    </Tabs>
  );
}
