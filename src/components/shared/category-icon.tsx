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
  Wallpaper,
  SprayCan,
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
  Wallpaper,
  SprayCan,
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
