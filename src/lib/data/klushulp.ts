import type { KlushulpTask } from "@/types";

/**
 * "Wat ga je doen?" funnel tasks shown on the homepage and above product lists.
 * Icon names map to lucide-react icons.
 */
export const klushulpTasks: KlushulpTask[] = [
  {
    id: "muur-verven",
    title: "Muur verven",
    slug: "muur-verven",
    icon: "Roller",
    description:
      "Van voorbereiding tot de laatste laag — alles voor een strakke muur.",
    relatedCategories: ["verf"],
  },
  {
    id: "kozijn-schilderen",
    title: "Kozijn schilderen",
    slug: "kozijn-schilderen",
    icon: "PaintbrushVertical",
    description: "Lak, grondverf en het juiste gereedschap voor strak houtwerk.",
    relatedCategories: ["verf"],
  },
  {
    id: "beitsen",
    title: "Beitsen",
    slug: "beitsen",
    icon: "TreePine",
    description: "Bescherm en verfraai je houtwerk binnen en buiten.",
    relatedCategories: ["verf", "tuin"],
  },
  {
    id: "vloer-leggen",
    title: "Vloer leggen",
    slug: "vloer-leggen",
    icon: "LayoutPanelTop",
    description: "Laminaat, PVC, ondervloer en het juiste legmateriaal.",
    relatedCategories: ["vloeren-raam"],
  },
  {
    id: "stopcontact-vervangen",
    title: "Stopcontact vervangen",
    slug: "stopcontact-vervangen",
    icon: "Plug",
    description: "Veilig je schakelmateriaal vervangen met heldere uitleg.",
    relatedCategories: ["elektra"],
  },
  {
    id: "tuin-opknappen",
    title: "Tuin opknappen",
    slug: "tuin-opknappen",
    icon: "Sprout",
    description: "Schutting beitsen, bestrating reinigen en meer.",
    relatedCategories: ["tuin"],
  },
];

export function getTask(slug: string): KlushulpTask | undefined {
  return klushulpTasks.find((t) => t.slug === slug);
}
