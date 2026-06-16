import type { Metadata } from "next";
import { LayoutDashboard, ShieldAlert } from "lucide-react";
import { AiContentManager } from "@/components/admin/ai-content-manager";
import { OrdersPanel } from "@/components/admin/orders-panel";
import { ChannableTestOrder } from "@/components/admin/channable-test-order";

export const metadata: Metadata = {
  title: "AI Contentbeheer",
  description: "Beheer AI-gegenereerde productcontent voor de KLUSR webshop.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="py-6 sm:py-8">
      <div className="container-klusr">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-klusr-black text-white">
              <LayoutDashboard className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                AI Contentbeheer
              </h1>
              <p className="text-sm text-muted-foreground">
                Genereer en beoordeel AI-suggesties voor productcontent.
              </p>
            </div>
          </div>
          <div className="flex w-fit items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
            <ShieldAlert className="h-3.5 w-3.5" />
            Demo — geen authenticatie
          </div>
        </div>

        {/* Manager */}
        <div className="mt-8">
          <AiContentManager />
        </div>

        {/* Orders + PostNL-verzendlabels */}
        <div className="mt-8">
          <OrdersPanel />
        </div>

        {/* Channable koppeling — testorder versturen */}
        <div className="mt-8">
          <ChannableTestOrder />
        </div>
      </div>
    </div>
  );
}
