"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useT } from "@/components/i18n/locale-provider";

/** Zoekbalk op de 404-pagina — stuurt door naar de zoekresultaten. */
export function NotFoundSearch() {
  const router = useRouter();
  const t = useT();
  const [q, setQ] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const query = q.trim();
        if (query) router.push(`/zoeken?q=${encodeURIComponent(query)}`);
      }}
      className="mx-auto mt-6 flex w-full max-w-lg gap-2"
      role="search"
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("notFound.searchPlaceholder")}
          className="h-12 w-full rounded-full border border-input bg-card pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          aria-label={t("notFound.searchAria")}
          autoFocus
        />
      </div>
      <button
        type="submit"
        className="shrink-0 rounded-full bg-primary px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        {t("notFound.searchSubmit")}
      </button>
    </form>
  );
}
