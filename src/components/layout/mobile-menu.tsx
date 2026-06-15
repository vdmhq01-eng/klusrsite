"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, ChevronRight, MapPin, Headphones, User, CreditCard } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "./logo";
import { navCategories } from "@/lib/data/categories";

const quickLinks = [
  { href: "/winkels", label: "Winkels", icon: MapPin },
  { href: "/kluspas", label: "Kluspas", icon: CreditCard },
  { href: "/klantenservice", label: "Klantenservice", icon: Headphones },
  { href: "/account", label: "Mijn account", icon: User },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Menu openen"
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-secondary lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </SheetTrigger>
      <SheetContent side="left" className="flex w-[88%] max-w-sm flex-col p-0">
        <SheetHeader className="border-b border-border">
          <SheetTitle asChild>
            <Logo onClick={() => setOpen(false)} />
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <nav className="p-2">
            <p className="px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Assortiment
            </p>
            <ul>
              {navCategories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/categorie/${cat.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-md px-3 py-3 text-sm font-semibold hover:bg-secondary"
                  >
                    {cat.title}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>

            <p className="px-3 pb-1 pt-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Handig
            </p>
            <ul>
              {quickLinks.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium hover:bg-secondary"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
