import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wide transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        action: "bg-klusr-action text-klusr-black",
        bestseller: "bg-klusr-black text-white",
        pro: "bg-klusr-red-dark text-white",
        nieuw: "bg-klusr-stock text-white",
        bundel: "bg-klusr-black text-klusr-action",
        outline: "border border-border text-foreground",
        stock: "bg-klusr-stock/10 text-klusr-stock",
        muted: "bg-secondary text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
