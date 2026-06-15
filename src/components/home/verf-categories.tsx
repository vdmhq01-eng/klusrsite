import Link from "next/link";
import { getCategory } from "@/lib/data/categories";
import { SectionHeading } from "@/components/shared/section-heading";
import { CategoryIcon } from "@/components/shared/category-icon";

const subIcons: Record<string, string> = {
  binnenverf: "PaintRoller",
  buitenverf: "Paintbrush",
  lak: "PaintbrushVertical",
  beits: "TreePine",
  primer: "PaintBucket",
  kleurstalen: "Layers",
  "verf-op-kleur": "PaintBucket",
};

export function VerfCategories() {
  const verf = getCategory("verf");
  if (!verf?.subCategories) return null;

  return (
    <section className="container-klusr">
      <SectionHeading
        title="Verf — onze specialiteit"
        subtitle="Op kleur gemengd, professionele kwaliteit"
        href="/categorie/verf"
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {verf.subCategories.map((sub) => (
          <Link
            key={sub.slug}
            href={`/categorie/verf/${sub.slug}`}
            className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
          >
            <span className="grid h-14 w-14 place-items-center rounded-full bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
              <CategoryIcon name={subIcons[sub.slug]} className="h-7 w-7" />
            </span>
            <span className="text-sm font-semibold leading-tight">{sub.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
