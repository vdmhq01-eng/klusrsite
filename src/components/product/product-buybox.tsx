"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Check,
  ShoppingCart,
  Heart,
  Truck,
  RotateCcw,
  Sparkles,
  CreditCard,
  Palette,
  Tag,
  Gift,
  PiggyBank,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import type { Product, ProductVariant, SelectedColor } from "@/types";
import type { GlansVariant } from "@/lib/data/products";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { StarRating } from "./star-rating";
import { StockStatus } from "./stock-status";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { ColorPickerDialog } from "@/components/color/color-picker-dialog";
import { useCart } from "@/lib/store/cart";
import { useFavorites } from "@/lib/store/favorites";
import { useMounted } from "@/lib/hooks/use-mounted";
import { baseStockByStore, paintBases, withBase } from "@/lib/paint-bases";

/** Snelkeuze: 100% wit — veruit de meest gekozen "kleur" voor mengverf. */
const WHITE_COLOR = { name: "100% wit", code: "RAL 9010", hex: "#FFFFFF", collection: "Wit" } as const;
import { isLightColor, findColor } from "@/lib/data/colors";
import { trackEvent, toAnalyticsItem } from "@/lib/tracking";
import { formatPrice, cn } from "@/lib/utils";
import { usePricingMode } from "@/lib/store/pricing-mode";
import { priceView } from "@/lib/pricing";
import { useT } from "@/components/i18n/locale-provider";
import type { MessageKey } from "@/lib/i18n/dictionaries";

/**
 * `pricing.ts` levert `vatSuffix` ("incl. btw"/"excl. btw") als vaste NL-string;
 * die mappen we hier naar een vertaalsleutel (NL blijft identiek, rest vertaalt).
 */
const VAT_SUFFIX_KEY: Record<string, MessageKey> = {
  "incl. btw": "price.inclVat",
  "excl. btw": "price.exclVat",
};

/**
 * GAMMA-stijl kortingsblok: pasprijs prominent + "X% KORTING"-badge + (optioneel)
 * prijs per liter en een uitleg-link. Werkt voor zowel KLUSRPAS als ProfPas.
 */
function PassDiscountBox({
  amount,
  passName,
  pct,
  perLiter,
  link,
  t,
}: {
  amount: number;
  passName: string;
  pct: number;
  perLiter: number | null;
  link?: ReactNode;
  t: ReturnType<typeof useT>;
}) {
  return (
    <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-black leading-none text-primary">
            {formatPrice(amount)}
          </p>
          <p className="mt-1 text-sm font-semibold">{t("pdp.withPass", { pass: passName })}</p>
        </div>
        <span className="shrink-0 rounded-md bg-primary px-2 py-1 text-xs font-extrabold uppercase tracking-wide text-white">
          {t("pdp.discountBadge", { pct })}
        </span>
      </div>
      {perLiter !== null && (
        <p className="mt-1.5 text-sm font-semibold text-primary">
          {t("pdp.perLiter", { price: formatPrice(perLiter) })}
        </p>
      )}
      <p className="mt-2 text-xs leading-snug text-muted-foreground">
        {t("pdp.passExplain", { pct, pass: passName })}
        {link ? <> {link}</> : null}
      </p>
    </div>
  );
}

const usps: { icon: typeof Truck; labelKey: MessageKey }[] = [
  { icon: Truck, labelKey: "pdp.usp.freeShipping" },
  { icon: RotateCcw, labelKey: "pdp.usp.returns" },
  { icon: Sparkles, labelKey: "usp.advice" },
  { icon: CreditCard, labelKey: "pdp.usp.afterpay" },
];

export function ProductBuybox({
  product,
  glansVariants = [],
}: {
  product: Product;
  glansVariants?: GlansVariant[];
}) {
  const t = useT();
  const [variant, setVariant] = useState<ProductVariant>(product.variants[0]);
  const [color, setColor] = useState<SelectedColor | undefined>();
  const [quantity, setQuantity] = useState(1);

  // Voorkeuze van kleur via ?kleur=<code> (bijv. vanuit de Kleurenkiezer-funnel).
  // Client-side gelezen zodat de productpagina statisch/ISR blijft.
  useEffect(() => {
    if (!product.colorMatchable) return;
    const code = new URLSearchParams(window.location.search).get("kleur");
    if (!code) return;
    const found = findColor(code);
    if (found) setColor(withBase(found));
  }, [product.colorMatchable]);

  const addItem = useCart((s) => s.addItem);
  const toggleFavorite = useFavorites((s) => s.toggle);
  const favoriteIds = useFavorites((s) => s.ids);
  const mounted = useMounted();
  const isFavorite = mounted && favoriteIds.includes(product.id);

  // Tinting base (from the chosen colour) adds a surcharge and has its own stock.
  const surcharge = color?.base?.surcharge ?? 0;
  const effectiveKLUSRPAS = variant.kluspasPrice + surcharge;
  const effectivePrice = variant.price + surcharge;
  const effectiveStock =
    color?.base && product.colorMatchable
      ? baseStockByStore(variant.stockByStore, color.base.id)
      : variant.stockByStore;

  const mode = usePricingMode((s) => s.mode);
  const priceInfo = priceView(
    {
      price: effectivePrice,
      kluspasPrice: effectiveKLUSRPAS,
      compareAtPrice:
        variant.compareAtPrice !== undefined ? variant.compareAtPrice + surcharge : undefined,
    },
    mounted ? mode : "particulier",
  );

  // GAMMA-stijl prijsweergave: normale prijs prominent bovenaan, de pasprijs in
  // een apart kortingsblok met "X% KORTING"-badge. De pasprijs (priceInfo.amount)
  // is mode-correct (KLUSRPAS incl. btw, ProfPas excl. btw).
  const showPass = Boolean(priceInfo.badge && priceInfo.savings && priceInfo.savings > 0);
  const isKlusPass = priceInfo.badge === "KLUSRPAS";
  const passName = isKlusPass ? "KLUSRPAS" : "ProfPas";
  const headlinePrice = priceInfo.normalPrice ?? priceInfo.amount;
  // Prijs per liter (alleen voor producten met een inhoud), afgeleid van de
  // getoonde bedragen zodat ze de juiste btw-modus volgen.
  const normalPerLiter = variant.size ? headlinePrice / variant.size : null;
  const memberPerLiter = variant.size && showPass ? priceInfo.amount / variant.size : null;

  function buildItem() {
    return addItem({ product, variant, quantity, color });
  }

  const router = useRouter();

  /** Direct afrekenen: leg in de winkelwagen en ga meteen naar de checkout
   * (daar staan o.a. Apple Pay / Google Pay zodra die in Mollie actief zijn). */
  function handleBuyNow() {
    if (product.colorMatchable && !color) {
      toast(t("pdp.chooseColorTitle"), {
        description: t("pdp.chooseColorBuy"),
      });
      return;
    }
    buildItem();
    trackEvent("begin_checkout", { value: variant.kluspasPrice * quantity });
    router.push("/checkout");
  }

  function handleAdd() {
    if (product.colorMatchable && !color) {
      toast(t("pdp.chooseColorTitle"), {
        description: t("pdp.chooseColorAdd"),
      });
      return;
    }
    buildItem();
    trackEvent("add_to_cart", {
      value: variant.kluspasPrice * quantity,
      items: [
        {
          ...toAnalyticsItem({
            id: product.id,
            title: product.title,
            brand: product.brand,
            category: product.category,
            price: variant.kluspasPrice,
            quantity,
          }),
          item_variant: variant.label,
        },
      ],
    });
    toast.success(t("pdp.addedToCart"), {
      description: `${product.title} · ${variant.label}${color ? ` · ${color.name}` : ""}`,
    });
  }


  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
          {product.brand}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold leading-tight sm:text-3xl">
          {product.title}
        </h1>
        <div className="mt-2 flex items-center gap-3">
          <StarRating rating={product.rating} size="md" showCount={false} />
          <a href="#reviews" className="text-sm font-medium text-muted-foreground hover:text-primary">
            {t("pdp.reviewsLink", { rating: product.rating.toFixed(1), count: product.reviewCount })}
          </a>
        </div>
      </div>

      {/* Highlights */}
      <ul className="grid gap-1.5">
        {product.highlights.map((h) => (
          <li key={h} className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 shrink-0 text-klusr-stock" strokeWidth={3} />
            {h}
          </li>
        ))}
      </ul>

      <Separator />

      {/* Price */}
      <div>
        {/* Adviesprijs (RRP) — doorgestreept boven de normale prijs. Mode-correct:
            alleen particulier met een échte adviesprijs (referenceLabel "Adviesprijs"). */}
        {priceInfo.referenceLabel === "Adviesprijs" && priceInfo.reference != null && (
          <p className="mb-1 text-sm text-muted-foreground">
            {t("price.advies")}{" "}
            <span className="font-medium line-through">{formatPrice(priceInfo.reference)}</span>
          </p>
        )}
        {/* Normale prijs — prominent (GAMMA-stijl) */}
        <div className="flex items-end gap-2.5">
          <span className="text-4xl font-black leading-none">
            {formatPrice(headlinePrice)}
          </span>
          <span className="mb-1.5 text-xs font-medium text-muted-foreground">
            {t(VAT_SUFFIX_KEY[priceInfo.vatSuffix])}
          </span>
        </div>
        {normalPerLiter !== null && (
          <p className="mt-1 text-sm text-muted-foreground">
            {t("pdp.perLiter", { price: formatPrice(normalPerLiter) })}
          </p>
        )}
        {showPass &&
          (isKlusPass ? (
            <Sheet>
              <PassDiscountBox
                amount={priceInfo.amount}
                passName={passName}
                pct={priceInfo.savingsPct ?? 0}
                perLiter={memberPerLiter}
                t={t}
                link={
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      className="font-semibold text-primary underline-offset-2 hover:underline"
                    >
                      {t("pdp.kluspas.link")}
                    </button>
                  </SheetTrigger>
                }
              />
              <SheetContent side="right" className="flex flex-col gap-0 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 shrink-0 text-primary" />
                    {t("pdp.kluspas.link")}
                  </SheetTitle>
                  <SheetDescription>{t("pdp.kluspas.drawer.intro")}</SheetDescription>
                </SheetHeader>
                <div className="flex-1 px-5 pb-5">
                  <ul className="grid gap-3">
                    {[
                      { icon: Tag, key: "pdp.kluspas.drawer.benefit1" as MessageKey },
                      { icon: Gift, key: "pdp.kluspas.drawer.benefit2" as MessageKey },
                      { icon: Palette, key: "pdp.kluspas.drawer.benefit3" as MessageKey },
                      { icon: PiggyBank, key: "pdp.kluspas.drawer.benefit4" as MessageKey },
                    ].map(({ icon: Icon, key }) => (
                      <li key={key} className="flex items-start gap-3 text-sm font-medium">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="pt-1.5">{t(key)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground">
                    {t("pdp.kluspas.drawer.how")}
                  </p>
                </div>
                <SheetFooter>
                  <Button asChild size="lg">
                    <Link href="/registreren">
                      {t("pdp.kluspas.drawer.cta")}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/kluspas">{t("pdp.kluspas.drawer.more")}</Link>
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          ) : (
            <PassDiscountBox
              amount={priceInfo.amount}
              passName={passName}
              pct={priceInfo.savingsPct ?? 0}
              perLiter={memberPerLiter}
              t={t}
            />
          ))}
        {surcharge > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            {t("pdp.surcharge", {
              base: color?.base?.label.toLowerCase() ?? "",
              amount: formatPrice(surcharge),
            })}
          </p>
        )}
      </div>

      {/* Stock + delivery (base-specific when a colour is chosen) */}
      <StockStatus
        stockByStore={effectiveStock}
        showScarcity
        showDelivery
        className="text-sm"
      />
      {color?.base && (
        <p className="-mt-2 text-xs text-muted-foreground">
          {t("pdp.stockForBasePre")}<strong>{color.base.label}</strong>{t("pdp.stockForBasePost")}
        </p>
      )}

      <Separator />

      {/* Variant selector — dropdown bij veel maten (bv. schroeven), anders knoppen */}
      {product.variants.length > 1 && (
        <div>
          <p className="mb-2 text-sm font-semibold">
            {t("pdp.sizeLabel")} <span className="text-muted-foreground">{variant.label}</span>
          </p>
          {product.variants.length > 8 ? (
            <select
              value={variant.id}
              onChange={(e) =>
                setVariant(
                  product.variants.find((v) => v.id === e.target.value) ?? product.variants[0],
                )
              }
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {product.variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVariant(v)}
                  className={cn(
                    "min-w-[64px] rounded-md border px-3 py-2 text-sm font-semibold transition-all",
                    v.id === variant.id
                      ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                      : "border-input bg-card hover:border-primary/40",
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Glansgraad — andere glansvarianten van dezelfde verflijn */}
      {glansVariants.length > 1 && (
        <div>
          <p className="mb-2 text-sm font-semibold">{t("plp.facet.glans")}</p>
          <div className="flex flex-wrap gap-2">
            {glansVariants.map((g) =>
              g.active ? (
                <span
                  key={g.id}
                  className="min-w-[64px] rounded-md border border-primary bg-primary/5 px-3 py-2 text-center text-sm font-semibold text-primary ring-1 ring-primary"
                >
                  {g.label}
                </span>
              ) : (
                <Link
                  key={g.id}
                  href={`/product/${g.slug}`}
                  className="min-w-[64px] rounded-md border border-input bg-card px-3 py-2 text-center text-sm font-semibold transition-all hover:border-primary/40"
                >
                  {g.label}
                </Link>
              ),
            )}
          </div>
        </div>
      )}

      {/* Mengverf — kleur kiezen + preview op de muur */}
      {product.colorMatchable && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{t("pdp.color")}</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary">
              <Palette className="h-3 w-3" />
              {t("plp.group.mengverf")}
            </span>
          </div>

          {(() => {
            const isWhite =
              color?.hex?.toUpperCase() === WHITE_COLOR.hex && color?.code === WHITE_COLOR.code;
            return (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={isWhite ? "default" : "outline"}
                  className="gap-2"
                  onClick={() => setColor(withBase({ ...WHITE_COLOR }))}
                >
                  <span className="h-4 w-4 rounded-full border border-black/20 bg-white shadow-inner" />
                  100% wit
                </Button>
                <ColorPickerDialog
                  value={color}
                  onConfirm={setColor}
                  trigger={
                    <Button variant="outline" className="gap-2">
                      <Palette className="h-4 w-4" />
                      {color && !isWhite ? t("pdp.changeColor") : t("pdp.chooseColor")}
                    </Button>
                  }
                />
              </div>
            );
          })()}

          {color ? (
            <div className="overflow-hidden rounded-xl border border-border">
              {/* Kleur op de muur */}
              <div
                className="relative flex aspect-[5/2] items-end p-4"
                style={{ backgroundColor: color.hex }}
              >
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/10 to-transparent" />
                <span
                  className={cn(
                    "relative rounded-md px-2 py-1 text-xs font-bold backdrop-blur",
                    isLightColor(color.hex) ? "bg-black/5 text-black/80" : "bg-white/20 text-white",
                  )}
                >
                  {color.name}
                  {color.code ? ` · ${color.code}` : ""}
                </span>
              </div>
              <div className="flex items-start gap-2 bg-secondary/40 p-3 text-xs text-muted-foreground">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span>
                  {t("pdp.mixed.pre")}
                  <strong className="text-foreground">{t("pdp.mixed.bold")}</strong>
                  {color.base ? t("pdp.mixed.inBase", { base: color.base.label.toLowerCase() }) : ""}
                  {t("pdp.mixed.post")}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t("pdp.anyColor")}
            </p>
          )}
        </div>
      )}

      {/* Quantity + CTAs */}
      <div className="flex flex-col gap-3">
        <div className="flex items-stretch gap-3">
          <QuantityStepper value={quantity} onChange={setQuantity} />
          <Button onClick={handleAdd} size="lg" className="flex-1">
            <ShoppingCart className="h-5 w-5" />
            {t("pdp.addToCart")}
          </Button>
        </div>
        <Button
          onClick={handleBuyNow}
          size="lg"
          className="w-full bg-klusr-black text-white hover:bg-klusr-black/90"
        >
          {t("pdp.buyNow")}
        </Button>
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => {
            toggleFavorite(product.id);
            toast(isFavorite ? t("pdp.favRemoved") : t("pdp.favAdded"), {
              description: product.title,
            });
          }}
        >
          <Heart className={cn("h-4 w-4", isFavorite && "fill-primary text-primary")} />
          {isFavorite ? t("pdp.favSaved") : t("pdp.favSave")}
        </Button>
      </div>

      {/* USPs */}
      <ul className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-secondary/40 p-3 sm:grid-cols-2">
        {usps.map(({ icon: Icon, labelKey }) => (
          <li key={labelKey} className="flex items-start gap-2 text-xs font-medium">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {t(labelKey)}
          </li>
        ))}
      </ul>

    </div>
  );
}

