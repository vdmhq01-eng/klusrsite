import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import type { Article } from "@/types";
import { Badge } from "@/components/ui/badge";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/advies/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card transition-shadow hover:shadow-card-hover"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={article.image}
          alt={article.title}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <Badge variant="muted" className="absolute left-3 top-3 bg-card/90 backdrop-blur">
          {article.category}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-bold leading-tight group-hover:text-primary">
          {article.title}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {article.readingTime} min leestijd
        </span>
      </div>
    </Link>
  );
}
