"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Heart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { useFavorites } from "@/lib/store/favorites";
import { useMounted } from "@/lib/hooks/use-mounted";
import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";

export function FavoritesGrid() {
  const mounted = useMounted();
  const ids = useFavorites((s) => s.ids);
  const clear = useFavorites((s) => s.clear);
  const [products, setProducts] = useState<Product[]>([]);

  // Fetch product cards for the favourite ids from the API so the full
  // catalogus is not bundled into the client.
  useEffect(() => {
    if (!mounted) return;
    if (ids.length === 0) {
      setProducts([]);
      return;
    }
    let active = true;
    fetch(`/api/products?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((d) => active && setProducts(d.products ?? []))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [ids, mounted]);

  function handleClear() {
    clear();
    toast("Favorieten gewist", {
      description: "Alle producten zijn uit je favorieten verwijderd.",
    });
  }

  if (products.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {products.length}{" "}
          {products.length === 1 ? "bewaard product" : "bewaarde producten"}
        </p>
        <Button variant="ghost" size="sm" onClick={handleClear}>
          <Trash2 className="h-4 w-4" />
          Wis alles
        </Button>
      </div>

      <ProductGrid products={products} listName="Mijn favorieten" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-16 text-center shadow-card">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
        <Heart className="h-8 w-8" />
      </span>
      <div>
        <p className="text-lg font-bold">Nog geen favorieten</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Tik op het hartje bij een product om het hier te bewaren. Zo vind je
          jouw favoriete verf en gereedschap altijd snel terug.
        </p>
      </div>
      <Button asChild className="mt-1">
        <Link href="/categorie/verf">
          Ontdek producten
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
