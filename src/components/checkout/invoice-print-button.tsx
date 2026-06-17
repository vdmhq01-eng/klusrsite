"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Print/opslaan-als-PDF van de factuur. */
export function InvoicePrintButton() {
  return (
    <Button onClick={() => window.print()} className="gap-2 print:hidden">
      <Printer className="h-4 w-4" />
      Print / opslaan als PDF
    </Button>
  );
}
