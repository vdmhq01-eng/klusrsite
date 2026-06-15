"use client";

import { useEffect, useState } from "react";
import { Gift, Check } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/tracking";

const STORAGE_KEY = "klusr-exit-intent-seen";

export function ExitIntentPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    let armed = true;
    const trigger = () => {
      if (!armed) return;
      armed = false;
      sessionStorage.setItem(STORAGE_KEY, "1");
      setOpen(true);
      trackEvent("exit_intent_shown", {});
    };

    // Desktop: mouse leaves the top of the viewport.
    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger();
    };
    // Fallback: after 45s of browsing.
    const timer = window.setTimeout(trigger, 45000);

    document.addEventListener("mouseout", onMouseOut);
    return () => {
      document.removeEventListener("mouseout", onMouseOut);
      window.clearTimeout(timer);
    };
  }, []);

  async function claim(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "exit-intent", tags: ["WELCOME5"] }),
      });
    } catch {
      /* non-blocking */
    }
    trackEvent("newsletter_signup", { source: "exit-intent" });
    setDone(true);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0">
        <div className="bg-gradient-to-br from-primary to-klusr-red-dark px-6 py-8 text-center text-white">
          <span className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-white/15">
            <Gift className="h-7 w-7" />
          </span>
          <h2 className="text-2xl font-extrabold">Wacht — pak je voordeel!</h2>
          <p className="mt-1 text-white/85">
            Ontvang <strong>5% korting</strong> op je eerste bestelling.
          </p>
        </div>

        <div className="p-6">
          {done ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-klusr-stock text-white">
                <Check className="h-6 w-6" strokeWidth={3} />
              </span>
              <p className="font-semibold">Gelukt! Check je inbox.</p>
              <p className="text-sm text-muted-foreground">
                Je kortingscode <strong className="text-primary">WELKOM5</strong> staat
                klaar in je eerste e-mail.
              </p>
              <Button onClick={() => setOpen(false)} className="mt-2 w-full">
                Verder winkelen
              </Button>
            </div>
          ) : (
            <form onSubmit={claim} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Jouw e-mailadres"
                className="h-12 w-full rounded-md border border-border bg-card px-4 text-sm outline-none ring-primary/20 focus:ring-2"
              />
              <Button type="submit" size="lg" className="w-full">
                Claim 5% korting
              </Button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
              >
                Nee bedankt, ik betaal liever de volle prijs
              </button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
