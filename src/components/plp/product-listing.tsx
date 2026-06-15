"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { Product, ProductBadge } from "@/types";
import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { trackEvent, toAnalyticsItem } from "@/lib/tracking";
import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------- config */

type SortKey = "populair" | "prijs-op" | "prijs-af" | "beoordeling" | "nieuwste";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "populair", label: "Populair" },
  { value: "prijs-op", label: "Prijs oplopend" },
  { value: "prijs-af", label: "Prijs aflopend" },
  { value: "beoordeling", label: "Best beoordeeld" },
  { value: "nieuwste", label: "Nieuwste" },
];

interface PriceBucket {
  id: string;
  label: string;
  min: number;
  max: number; // Infinity for open-ended
}

const PRICE_BUCKETS: PriceBucket[] = [
  { id: "lt25", label: "Tot € 25", min: 0, max: 25 },
  { id: "25-50", label: "€ 25 – € 50", min: 25, max: 50 },
  { id: "50-100", label: "€ 50 – € 100", min: 50, max: 100 },
  { id: "gt100", label: "Vanaf € 100", min: 100, max: Infinity },
];

// Badges exposed as facets (NIEUW omitted — not used as a filter here).
const BADGE_FILTERS: ProductBadge[] = ["ACTIE", "BESTSELLER", "PRO KEUZE", "BUNDEL"];

const BADGE_LABELS: Record<ProductBadge, string> = {
  ACTIE: "Actie",
  BESTSELLER: "Bestseller",
  "PRO KEUZE": "Pro keuze",
  NIEUW: "Nieuw",
  BUNDEL: "Voordeelbundel",
};

/** Total stock across all stores for a product. */
function totalStock(product: Product): number {
  return product.stockByStore.reduce((sum, s) => sum + s.quantity, 0);
}

interface Filters {
  brands: string[];
  priceBuckets: string[];
  badges: ProductBadge[];
  mengverf: boolean;
}

const EMPTY_FILTERS: Filters = {
  brands: [],
  priceBuckets: [],
  badges: [],
  mengverf: false,
};

/* --------------------------------------------------------------- component */

interface ProductListingProps {
  products: Product[];
  /** Analytics list context + grid list name. */
  listName?: string;
  className?: string;
}

export function ProductListing({
  products,
  listName,
  className,
}: ProductListingProps) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>("populair");
  const [sheetOpen, setSheetOpen] = useState(false);

  // Uitverkochte producten tonen we niet (geen voorraad in welke winkel dan ook).
  const visibleProducts = useMemo(
    () => products.filter((p) => totalStock(p) > 0),
    [products],
  );

  // Brands present in this product set, alphabetically.
  const availableBrands = useMemo(
    () =>
      Array.from(new Set(visibleProducts.map((p) => p.brand))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [visibleProducts],
  );

  // Only show badge facets that actually occur in the set.
  const availableBadges = useMemo(
    () => BADGE_FILTERS.filter((b) => visibleProducts.some((p) => p.badges?.includes(b))),
    [visibleProducts],
  );

  const hasMengverf = useMemo(
    () => visibleProducts.some((p) => p.colorMatchable),
    [visibleProducts],
  );

  const filtered = useMemo(() => {
    return visibleProducts.filter((p) => {
      if (filters.mengverf && !p.colorMatchable) return false;
      if (filters.brands.length && !filters.brands.includes(p.brand)) return false;

      if (filters.priceBuckets.length) {
        const inBucket = filters.priceBuckets.some((id) => {
          const bucket = PRICE_BUCKETS.find((b) => b.id === id);
          if (!bucket) return false;
          return p.price >= bucket.min && p.price < bucket.max;
        });
        if (!inBucket) return false;
      }

      if (filters.badges.length) {
        const hasBadge = filters.badges.some((b) => p.badges?.includes(b));
        if (!hasBadge) return false;
      }

      return true;
    });
  }, [visibleProducts, filters]);

  const sorted = useMemo(() => {
    // "populair"/"nieuwste" keep the curated source order (stable).
    if (sort === "populair" || sort === "nieuwste") return filtered;
    const copy = [...filtered];
    switch (sort) {
      case "prijs-op":
        copy.sort((a, b) => a.price - b.price);
        break;
      case "prijs-af":
        copy.sort((a, b) => b.price - a.price);
        break;
      case "beoordeling":
        copy.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
        break;
    }
    return copy;
  }, [filtered, sort]);

  const activeFilterCount =
    filters.brands.length +
    filters.priceBuckets.length +
    filters.badges.length +
    (filters.mengverf ? 1 : 0);

  function toggleIn<T>(list: T[], value: T): T[] {
    return list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value];
  }

  const toggleBrand = (brand: string) =>
    setFilters((f) => ({ ...f, brands: toggleIn(f.brands, brand) }));
  const toggleBucket = (id: string) =>
    setFilters((f) => ({ ...f, priceBuckets: toggleIn(f.priceBuckets, id) }));
  const toggleBadge = (badge: ProductBadge) =>
    setFilters((f) => ({ ...f, badges: toggleIn(f.badges, badge) }));
  const toggleMengverf = () => setFilters((f) => ({ ...f, mengverf: !f.mengverf }));
  const clearFilters = () => setFilters(EMPTY_FILTERS);

  // Fire view_item_list once on mount (matches the ViewItemListTracker shape).
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current || visibleProducts.length === 0) return;
    fired.current = true;
    trackEvent("view_item_list", {
      item_list_name: listName ?? "Productoverzicht",
      items: visibleProducts.slice(0, 12).map((p) =>
        toAnalyticsItem({
          id: p.id,
          title: p.title,
          brand: p.brand,
          category: p.category,
          price: p.kluspasPrice,
        }),
      ),
    });
  }, [visibleProducts, listName]);

  const filterPanel = (
    <FilterControls
      availableBrands={availableBrands}
      availableBadges={availableBadges}
      hasMengverf={hasMengverf}
      filters={filters}
      onToggleBrand={toggleBrand}
      onToggleBucket={toggleBucket}
      onToggleBadge={toggleBadge}
      onToggleMengverf={toggleMengverf}
    />
  );

  return (
    <div className={cn("container-klusr", className)}>
      <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold">Filters</h2>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Wis filters ({activeFilterCount})
                </button>
              )}
            </div>
            {filterPanel}
          </div>
        </aside>

        <div>
          {/* Toolbar: result count + mobile filter trigger + sort */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground">{sorted.length}</span>{" "}
              {sorted.length === 1 ? "product" : "producten"}
            </p>

            <div className="flex items-center gap-2">
              {/* Mobile filters trigger */}
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="flex max-h-[85vh] flex-col" hideClose>
                  <SheetHeader className="flex-row items-center justify-between space-y-0 border-b border-border">
                    <SheetTitle>Filters</SheetTitle>
                    <div className="flex items-center gap-3">
                      {activeFilterCount > 0 && (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          Wis filters
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSheetOpen(false)}
                        aria-label="Sluiten"
                        className="rounded-md p-1 text-muted-foreground hover:bg-secondary"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-5 py-4">{filterPanel}</div>
                  <SheetFooter>
                    <Button onClick={() => setSheetOpen(false)} size="lg">
                      Toon {sorted.length}{" "}
                      {sorted.length === 1 ? "product" : "producten"}
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger className="h-9 w-[170px] text-sm" aria-label="Sorteren">
                  <SelectValue placeholder="Sorteren" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {filters.brands.map((brand) => (
                <FilterChip key={`b-${brand}`} onRemove={() => toggleBrand(brand)}>
                  {brand}
                </FilterChip>
              ))}
              {filters.priceBuckets.map((id) => (
                <FilterChip key={`p-${id}`} onRemove={() => toggleBucket(id)}>
                  {PRICE_BUCKETS.find((b) => b.id === id)?.label ?? id}
                </FilterChip>
              ))}
              {filters.badges.map((badge) => (
                <FilterChip key={`bd-${badge}`} onRemove={() => toggleBadge(badge)}>
                  {BADGE_LABELS[badge]}
                </FilterChip>
              ))}
              {filters.mengverf && (
                <FilterChip onRemove={toggleMengverf}>Op kleur te mengen</FilterChip>
              )}
            </div>
          )}

          {/* Results */}
          {sorted.length > 0 ? (
            <ProductGrid products={sorted} listName={listName} />
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
              <p className="text-base font-bold">Geen producten gevonden</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Pas je filters aan om meer resultaten te zien.
              </p>
              <Button onClick={clearFilters} variant="outline" className="mt-4">
                Wis alle filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------- reusable sub-pieces */

function FilterControls({
  availableBrands,
  availableBadges,
  hasMengverf,
  filters,
  onToggleBrand,
  onToggleBucket,
  onToggleBadge,
  onToggleMengverf,
}: {
  availableBrands: string[];
  availableBadges: ProductBadge[];
  hasMengverf: boolean;
  filters: Filters;
  onToggleBrand: (brand: string) => void;
  onToggleBucket: (id: string) => void;
  onToggleBadge: (badge: ProductBadge) => void;
  onToggleMengverf: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {hasMengverf && (
        <>
          <FilterGroup title="Mengverf">
            <CheckRow
              id="filter-mengverf"
              checked={filters.mengverf}
              onChange={onToggleMengverf}
              label="Op kleur te mengen"
            />
          </FilterGroup>
          <Separator />
        </>
      )}
      <FilterGroup title="Prijs">
        {PRICE_BUCKETS.map((bucket) => (
          <CheckRow
            key={bucket.id}
            id={`filter-price-${bucket.id}`}
            checked={filters.priceBuckets.includes(bucket.id)}
            onChange={() => onToggleBucket(bucket.id)}
            label={bucket.label}
          />
        ))}
      </FilterGroup>

      {availableBadges.length > 0 && (
        <>
          <Separator />
          <FilterGroup title="Acties & labels">
            {availableBadges.map((badge) => (
              <CheckRow
                key={badge}
                id={`filter-badge-${badge}`}
                checked={filters.badges.includes(badge)}
                onChange={() => onToggleBadge(badge)}
                label={BADGE_LABELS[badge]}
              />
            ))}
          </FilterGroup>
        </>
      )}

      {availableBrands.length > 1 && (
        <>
          <Separator />
          <FilterGroup title="Merk">
            {availableBrands.map((brand) => (
              <CheckRow
                key={brand}
                id={`filter-brand-${brand}`}
                checked={filters.brands.includes(brand)}
                onChange={() => onToggleBrand(brand)}
                label={brand}
              />
            ))}
          </FilterGroup>
        </>
      )}
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2.5 text-sm font-bold">{title}</h3>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

function CheckRow({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Checkbox id={id} checked={checked} onCheckedChange={() => onChange()} />
      <Label htmlFor={id} className="cursor-pointer text-sm font-normal">
        {label}
      </Label>
    </div>
  );
}

function FilterChip({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
    >
      {children}
      <X className="h-3 w-3" />
    </button>
  );
}
