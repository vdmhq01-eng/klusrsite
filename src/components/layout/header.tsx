import Link from "next/link";
import { Headphones, User } from "lucide-react";
import { TopBar } from "./topbar";
import { Logo } from "./logo";
import { SearchBar } from "./search-bar";
import { CartButton } from "./cart-button";
import { MainNav } from "./main-nav";
import { MobileMenu } from "./mobile-menu";
import { AccountNav } from "./account-nav";
import { t } from "@/lib/i18n/server";

function HeaderAction({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: typeof User;
}) {
  return (
    <Link
      href={href}
      className="hidden flex-col items-center justify-center gap-0.5 text-xs font-medium text-foreground transition-colors hover:text-primary md:flex"
    >
      <Icon className="h-5 w-5" />
      <span className="hidden lg:inline">{label}</span>
    </Link>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full shadow-header">
      <TopBar />
      <div className="bg-card">
        <div className="container-klusr">
          <div className="flex h-16 items-center gap-3 lg:h-[68px]">
            <MobileMenu />
            <Logo className="shrink-0" />

            <div className="hidden flex-1 px-4 md:block lg:px-8">
              <SearchBar />
            </div>

            <div className="ml-auto flex items-center gap-4 lg:gap-6">
              <HeaderAction href="/klantenservice" label={t("nav.customerService")} icon={Headphones} />
              <AccountNav />
              <CartButton />
            </div>
          </div>

          {/* Mobile search row */}
          <div className="pb-3 md:hidden">
            <SearchBar />
          </div>
        </div>
      </div>
      <MainNav />
    </header>
  );
}
