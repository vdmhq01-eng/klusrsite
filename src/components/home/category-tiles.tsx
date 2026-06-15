import Image from "next/image";
import Link from "next/link";
import { navCategories } from "@/lib/data/categories";
import { SectionHeading } from "@/components/shared/section-heading";

export function CategoryTiles() {
  const tiles = navCategories.filter((c) => c.slug !== "acties");

  return (
    <section className="container-klusr">
      <SectionHeading title="Shop per categorie" subtitle="Alles voor jouw klus onder één dak" />
      {/* Horizontally scrollable on mobile, grid on desktop */}
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0 lg:grid-cols-8">
        {tiles.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categorie/${cat.slug}`}
            className="group relative flex aspect-square w-32 shrink-0 flex-col justify-end overflow-hidden rounded-xl sm:w-auto"
          >
            <Image
              src={cat.image}
              alt={cat.title}
              fill
              sizes="(max-width: 640px) 128px, 12vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-klusr-black/85 to-transparent" />
            <span className="relative p-3 text-sm font-bold text-white">{cat.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
