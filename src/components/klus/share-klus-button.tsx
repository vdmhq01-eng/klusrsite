"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * "Deel"-knop voor een kluspakket: gebruikt de native deel-functie op mobiel en
 * valt anders terug op het kopiëren van de (deelbare) URL naar het klembord.
 */
export function ShareKlusButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (!url) return;
    // Native deelvenster waar beschikbaar (vooral mobiel).
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Geannuleerd of niet ondersteund → val terug op kopiëren.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link gekopieerd", { description: "Deel je kluspakket met wie je maar wilt." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Kopiëren lukte niet. Kopieer de link uit de adresbalk.");
    }
  }

  return (
    <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={share}>
      {copied ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
      {copied ? "Gekopieerd" : "Deel"}
    </Button>
  );
}
