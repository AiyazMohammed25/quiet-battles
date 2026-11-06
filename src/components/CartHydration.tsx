"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";

// Restore the saved cart after React hydrates so server and browser markup match.
export default function CartHydration() {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);

  return null;
}
