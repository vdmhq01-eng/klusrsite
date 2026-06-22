import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Sparkles } from "lucide-react";
import { getKlus } from "@/lib/store/klus";
import { getProductById } from "@/lib/data/products";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { ProductImage } from "@/components/product/product-image";
import { AddAllToCart } from "@/components/klus/add-all-to-cart";
import { ShareKlusButton } from "@/components/klus/share-klus-button";

export const dynamic = "force-dynamic";

interface KlusPageProps {
  params: { id: string };
}

/** Een opgeloste regel: het kluspakket-item gekoppeld aan een echt product. */
interface ResolvedLine {
  product: Product;
  quantity: number;
  reason?: string;
}

export async function generateMetadata({ params }: KlusPageProps): Promise<Metadata> {
  const klus = await getKlus(params.id);
  if (!klus) return { title: "Kluspakket niet gevonden" };
  return {
    title: `${klus.title} — kluspakket | KLUSR`,
    description:
      klus.intro ??
      "Jouw persoonlijke kluspakket met alle benodigde producten, samengesteld door de KLUSR Klushulp.",
    robots: { index: false, follow: false },
  };
}

export default async function KlusPage({ params }: KlusPageProps) {
  const klus = await getKlus(params.id);
  if (!klus) notFound();

  // Koppel elk item aan een echt catalogusproduct; verdwenen producten vallen weg.
  const lines: ResolvedLine[] = [];
  for (const item of klus.items) {
    const product = getProductById(item.productId);
    if (!product) continue;
    lines.push({ product, quantity: item.quantity, reason: item.reason });
  }

  const total = lines.reduce((sum, l) => sum + l.product.variants[0].price * l.quantity, 0);
  const totalUnits = lines.reduce((sum, l) => sum + l.quantity, 0);
  // Items voor de "alles in winkelwagen"-knop (alleen wat resolved is).
  const cartItems = lines.map((l) => ({ productId: l.product.id, quantity: l.quantity }));

  return (
    <div className="container-klusr py-8 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link
            href="/klushulp"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Naar de Klushulp
          </Link>
        </div>

        {/* Kop */}
        <div className="mb-6">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary">
            <Sparkles className="h-4 w-4" />
            Jouw kluspakket
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{klus.title}</h1>
          {klus.intro && (
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">{klus.intro}</p>
          )}
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card py-12 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
              <Package className="h-6 w-6" />
            </span>
            <p className="text-sm font-semibold">Geen producten gevonden voor deze klus</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Vraag de Klushulp gerust opnieuw om advies — dan stellen we een nieuw pakket samen.
            </p>
          </div>
        ) : (
          <>
            {/* Acties bovenaan — direct toevoegen of delen. */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <AddAllToCart items={cartItems} />
              <ShareKlusButton title={klus.title} />
            </div>

            {/* Productlijst */}
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <ul className="divide-y divide-border">
                {lines.map((line) => {
                  const variant = line.product.variants[0];
                  return (
                    <li key={line.product.id} className="flex gap-4 p-4">
                      <Link
                        href={`/product/${line.product.slug}`}
                        className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-white"
                      >
                        <ProductImage
                          src={line.product.images[0]}
                          alt={line.product.title}
                          sizes="80px"
                          className="object-contain p-1"
                        />
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                          {line.product.brand}
                        </p>
                        <Link
                          href={`/product/${line.product.slug}`}
                          className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors hover:text-primary"
                        >
                          {line.product.title}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {variant.label && <>{variant.label} · </>}
                          <span className="font-semibold text-foreground">{line.quantity}×</span>
                        </p>
                        {line.reason && (
                          <p className="mt-1 text-xs italic text-muted-foreground">{line.reason}</p>
                        )}
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-black">
                          {formatPrice(variant.price * line.quantity)}
                        </p>
                        {line.quantity > 1 && (
                          <p className="text-[11px] text-muted-foreground">
                            {formatPrice(variant.price)} p/st
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Totaal */}
              <div className="flex items-center justify-between border-t border-border bg-secondary/40 px-4 py-3.5">
                <span className="text-sm font-semibold">
                  Totaal · {totalUnits} {totalUnits === 1 ? "artikel" : "artikelen"}
                </span>
                <span className="text-lg font-black tracking-tight">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Acties onderaan — herhaald voor het gemak. */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <AddAllToCart items={cartItems} />
              <ShareKlusButton title={klus.title} />
            </div>

            <p className="mt-6 rounded-lg bg-secondary/60 p-3 text-xs text-muted-foreground">
              Tip: deze pagina is deelbaar — stuur de link naar wie met je meeklust. Pas de aantallen
              gerust aan in de winkelwagen. Prijzen onder voorbehoud; bekijk de actuele prijs en
              voorraad op de productpagina.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
