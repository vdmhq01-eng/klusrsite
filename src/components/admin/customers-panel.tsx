"use client";

import { useMemo } from "react";
import { Users } from "lucide-react";
import type { Order, OrderStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice, formatDate } from "@/lib/utils";

const PAID: OrderStatus[] = ["paid", "authorized", "shipped", "delivered"];

interface Customer {
  email: string;
  name: string;
  city: string;
  orders: number;
  spent: number;
  last: string;
}

/** Klantenoverzicht, afgeleid uit de orders (uniek per e-mailadres). */
export function CustomersPanel({ orders }: { orders: Order[] }) {
  const customers = useMemo(() => {
    const map = new Map<string, Customer>();
    for (const o of orders) {
      const email = o.customer.email.toLowerCase();
      const paid = PAID.includes(o.paymentStatus);
      const existing = map.get(email);
      if (existing) {
        existing.orders += 1;
        if (paid) existing.spent += o.total;
        if (o.createdAt > existing.last) {
          existing.last = o.createdAt;
          existing.city = o.customer.city;
        }
      } else {
        map.set(email, {
          email,
          name: `${o.customer.firstName} ${o.customer.lastName}`.trim(),
          city: o.customer.city,
          orders: 1,
          spent: paid ? o.total : 0,
          last: o.createdAt,
        });
      }
    }
    return [...map.values()].sort((a, b) => b.spent - a.spent);
  }, [orders]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Klanten</CardTitle>
        <p className="text-sm text-muted-foreground">
          {customers.length} klant(en), afgeleid uit de orders. Nieuwste bovenaan op besteed bedrag.
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="py-2 pr-3 font-semibold">Klant</th>
                <th className="py-2 pr-3 font-semibold">E-mail</th>
                <th className="py-2 pr-3 text-right font-semibold">Orders</th>
                <th className="py-2 pr-3 text-right font-semibold">Besteed</th>
                <th className="py-2 pr-3 font-semibold">Laatste</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.email} className="border-b border-border">
                  <td className="py-2.5 pr-3">
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.city}</div>
                  </td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{c.email}</td>
                  <td className="py-2.5 pr-3 text-right">{c.orders}</td>
                  <td className="py-2.5 pr-3 text-right font-semibold">{formatPrice(c.spent)}</td>
                  <td className="py-2.5 pr-3 text-xs text-muted-foreground">{formatDate(c.last)}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    <Users className="mx-auto mb-2 h-6 w-6 opacity-50" />
                    Nog geen klanten.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Demo: gebaseerd op de in-memory orders. Voor échte klantgegevens koppel je een database
          of de Channable/Tilroy-orders.
        </p>
      </CardContent>
    </Card>
  );
}
