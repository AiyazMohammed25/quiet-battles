"use client";

import { useEffect } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";

// Format a price as Indian rupees for the cart.
const formatPrice = (price: number) =>
  `₹${price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

// Show cart items and let the user change quantities or remove items.
export default function CartDrawer() {
  const isOpen = useCartStore((state) => state.isOpen);
  const items = useCartStore((state) => state.items);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const totalQuantity = items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  useEffect(() => {
    if (!isOpen) return;

    // Close the cart when the user presses Escape.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") toggleCart(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, toggleCart]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="Close shopping bag"
        className="absolute inset-0 h-full w-full cursor-default bg-black/70 backdrop-blur-[2px]"
        onClick={() => toggleCart(false)}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className="absolute right-0 top-0 flex h-full w-full max-w-[480px] flex-col border-l border-white/10 bg-[#101010] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-[9px] uppercase tracking-[0.25em] text-zinc-500">
              Your selection
            </p>
            <h2
              id="cart-title"
              className="mt-1 text-sm font-semibold uppercase tracking-[0.16em]"
            >
              The Bag ({totalQuantity})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => toggleCart(false)}
            className="flex h-10 w-10 items-center justify-center text-zinc-400 transition hover:text-white"
            aria-label="Close shopping bag"
          >
            <X size={18} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <ShoppingBag size={30} strokeWidth={1} className="text-zinc-600" />
            <p className="mt-6 text-xs uppercase tracking-[0.18em]">
              Your bag is quiet.
            </p>
            <p className="mt-2 max-w-[240px] text-xs leading-6 text-zinc-500">
              Find a piece that speaks to the battles you carry.
            </p>
            <Link
              href="/archive/series-01"
              onClick={() => toggleCart(false)}
              className="mt-7 border-b border-white/50 pb-1 text-[10px] uppercase tracking-[0.18em] transition hover:border-white"
            >
              Explore Series 01
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              <ul className="divide-y divide-white/10">
                {items.map((item) => (
                  <li
                    key={`${item.id}-${item.size}`}
                    className="flex gap-4 py-6"
                  >
                    <div className="visual-product flex h-28 w-24 shrink-0 items-center justify-center border border-white/10">
                      <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-500">
                        QB / 01
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="flex justify-between gap-3">
                        <div>
                          <h3 className="text-xs font-medium leading-5">
                            {item.name}
                          </h3>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                            Size {item.size}
                          </p>
                        </div>
                        <p className="shrink-0 text-xs">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-white/15">
                          <button
                            type="button"
                            aria-label={`Decrease ${item.name} quantity`}
                            onClick={() =>
                              setQuantity(
                                item.id,
                                item.size,
                                item.quantity - 1,
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center text-zinc-400 hover:text-white"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-7 text-center text-[10px]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase ${item.name} quantity`}
                            onClick={() =>
                              setQuantity(
                                item.id,
                                item.size,
                                item.quantity + 1,
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center text-zinc-400 hover:text-white"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id, item.size)}
                          className="flex items-center gap-1 text-[9px] uppercase tracking-[0.12em] text-zinc-500 transition hover:text-white"
                          aria-label={`Remove ${item.name}, size ${item.size}`}
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-white/10 px-6 py-6">
              <div className="flex justify-between text-xs uppercase tracking-[0.14em]">
                <span className="text-zinc-400">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-2 text-[10px] leading-5 text-zinc-500">
                Shipping and taxes are calculated at checkout.
              </p>
              <button
                type="button"
                disabled
                className="mt-5 w-full cursor-not-allowed bg-white/10 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500"
                title="Checkout is not connected in this assessment demo"
              >
                Checkout — coming soon
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
