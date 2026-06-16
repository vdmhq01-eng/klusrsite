import {
  PaintBucket,
  PaintRoller,
  Paintbrush,
  PaintbrushVertical,
  Layers,
  Wrench,
  Plug,
  Hammer,
  Sprout,
  Lightbulb,
  LayoutPanelTop,
  Tag,
  TreePine,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  PaintBucket,
  PaintRoller,
  Roller: PaintRoller,
  Paintbrush,
  PaintbrushVertical,
  Layers,
  Wrench,
  Plug,
  Hammer,
  Sprout,
  Lightbulb,
  LayoutPanelTop,
  Tag,
  TreePine,
};

export function CategoryIcon({
  name,
  className,
}: {
  name?: string;
  className?: string;
}) {
  const Icon = (name && iconMap[name]) || PaintBucket;
  return <Icon className={className} />;
}
