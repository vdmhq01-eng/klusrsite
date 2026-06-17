"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { Product } from "@/types";
import { useCart } from "@/lib/store/cart";
import { useMounted } from "@/lib/hooks/use-mounted";
import { SectionHeading } from "@/components/shared/section-heading";
import { ProductCarousel } from "@/components/shared/product-carousel";

/**
 * Persoonlijke homepage-secties voor terugkerende klanten: aanbevelingen op
 * basis van bekeken producten (lokaal) en bestelhistorie (server). Verborgen
 * voor nieuwe bezoekers zonder historie.
 */
export function ForYouSection() {
  const ids = useCart((s) => s.recentlyViewed);
  const { data: session, status } = useSession();
  const mounted = useMounted();
  const [forYou, setForYou] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  useEffect(() => {
    if (!mounted) return;
    if (ids.length === 0 && !session) {
      setForYou([]);
      setRecentlyViewed([]);
      return;
    }
    let active = true;
    fetch("/api/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setForYou(Array.isArray(d.forYou) ? d.forYou : []);
        setRecentlyViewed(Array.isArray(d.recentlyViewed) ? d.recentlyViewed : []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
    // status zorgt dat we opnieuw ophalen zodra de sessie geladen/gewijzigd is.
  }, [ids, session, status, mounted]);

  if (!mounted) return null;
  const showForYou = forYou.length >= 3;
  const showViewed = recentlyViewed.length >= 2;
  if (!showForYou && !showViewed) return null;

  return (
    <>
      {showForYou && (
        <section className="container-klusr">
          <SectionHeading
            title="Speciaal voor jou"
            subtitle="Aanbevolen op basis van wat je bekeek en bestelde"
          />
          <ProductCarousel products={forYou} listName="Voor jou" />
        </section>
      )}
      {showViewed && (
        <section className="container-klusr">
          <SectionHeading title="Verder kijken" subtitle="Onlangs door jou bekeken" />
          <ProductCarousel products={recentlyViewed} listName="Recent bekeken" />
        </section>
      )}
    </>
  );
}
