"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Geeft ~450 ms `true` zodra `value` toeneemt (bv. de winkelwagen-teller) —
 * handig voor een korte "bump"-animatie op het icoon.
 */
export function useBumpOnIncrease(value: number): boolean {
  const prev = useRef(value);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (value > prev.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 450);
      prev.current = value;
      return () => clearTimeout(t);
    }
    prev.current = value;
  }, [value]);

  return bump;
}
