"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import type { ProductContent, ProductSize } from "@/types/content";

// Format a product price as Indian rupees.
const formatPrice = (price: number) => `₹${price.toLocaleString("en-IN")}`;

// Let the customer choose a size and add the product to the cart.
export default function ProductPurchasePanel({
  product,
}: {
  product: ProductContent;
}) {
  const [selectedSize, setSelectedSize] = useState<ProductSize>(
    product.sizes[0] ?? "M",
  );
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  // Add this product with the selected size, then show brief feedback.
  const handleAddToCart = () => {
    addItem({
      id: product.slug,
      name: product.name,
      price: product.price,
      size: selectedSize,
      quantity: 1,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="mx-auto max-w-[1280px] px-5 py-10 sm:px-8 md:py-14 lg:px-12">
      <Link
        href="/archive"
        className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-zinc-500 transition hover:text-white"
      >
        <ArrowLeft size={13} /> Back to the archive
      </Link>

      <div className="mt-8 grid gap-9 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div
          className="visual-product relative flex aspect-[4/4.7] min-h-[360px] items-end border border-white/10 sm:min-h-[500px]"
          role="img"
          aria-label={`Editorial product artwork for ${product.name}`}
        >
          <div className="absolute inset-5 border border-white/10 sm:inset-8" />
          <span className="absolute left-9 top-9 text-[9px] uppercase tracking-[0.2em] text-zinc-500">
            Quiet Battles™ / Product study
          </span>
          <div className="relative z-10 flex w-full items-end justify-between p-8">
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                Current status
              </p>
              <p className="mt-2 text-sm uppercase tracking-[0.14em]">
                {product.stockStatus}
              </p>
            </div>
            <span className="text-[9px] tracking-[0.16em] text-zinc-500">
              01 / 01
            </span>
          </div>
        </div>

        <div className="flex flex-col pt-1 lg:py-6">
          <p className="text-[9px] uppercase tracking-[0.22em] text-zinc-500">
            Quiet Battles™ / Series 01
          </p>
          <h1 className="mt-4 max-w-xl text-3xl font-medium uppercase leading-[1.02] tracking-[-0.05em] sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-5 text-lg font-light tracking-wide">
            {formatPrice(product.price)}
          </p>
          <p className="mt-7 max-w-lg text-sm leading-7 text-zinc-400">
            {product.description}
          </p>

          <div className="mt-9 border-t border-white/10 pt-6">
            <div className="flex items-center justify-between">
              <p className="text-[9px] uppercase tracking-[0.18em] text-zinc-300">
                Select size{" "}
                <span className="text-zinc-600">/ {selectedSize}</span>
              </p>
              <button
                type="button"
                aria-expanded={sizeGuideOpen}
                aria-controls="size-guide"
                onClick={() => setSizeGuideOpen((open) => !open)}
                className="text-[9px] uppercase tracking-[0.15em] text-zinc-500 underline underline-offset-4 transition hover:text-white"
              >
                {sizeGuideOpen ? "Close size guide" : "Size guide"}
              </button>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  aria-pressed={selectedSize === size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-h-12 border text-[10px] font-medium tracking-[0.12em] transition ${
                    selectedSize === size
                      ? "border-white bg-white text-black"
                      : "border-white/15 text-zinc-400 hover:border-white/50 hover:text-white"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {sizeGuideOpen && (
              <div
                id="size-guide"
                className="mt-4 border border-white/10 bg-white/[0.03] p-4"
              >
                <p className="text-[9px] uppercase tracking-[0.17em]">
                  Fit notes
                </p>
                <p className="mt-2 text-xs leading-5 text-zinc-400">
                  Designed for a relaxed fit with room for a base layer. Choose
                  your usual size; size down for a closer fit.
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.stockStatus === "Out of stock"}
            className="mt-6 flex min-h-14 w-full items-center justify-center gap-3 bg-white px-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-zinc-500"
          >
            <ShoppingBag size={15} strokeWidth={1.5} />
            {product.stockStatus === "Out of stock"
              ? "Currently unavailable"
              : added
                ? "Added to your bag"
                : `Add to bag — ${formatPrice(product.price)}`}
          </button>
          <p aria-live="polite" className="sr-only">
            {added
              ? `${product.name}, size ${selectedSize}, added to your bag.`
              : ""}
          </p>

          <div className="mt-7 grid grid-cols-3 gap-3 border-y border-white/10 py-5">
            <div className="space-y-2 text-center">
              <ShieldCheck size={16} className="mx-auto text-zinc-500" />
              <p className="text-[8px] uppercase leading-4 tracking-[0.1em] text-zinc-500">
                Considered design
              </p>
            </div>
            <div className="space-y-2 text-center">
              <Truck size={16} className="mx-auto text-zinc-500" />
              <p className="text-[8px] uppercase leading-4 tracking-[0.1em] text-zinc-500">
                Delivery details at checkout
              </p>
            </div>
            <div className="space-y-2 text-center">
              <RefreshCw size={16} className="mx-auto text-zinc-500" />
              <p className="text-[8px] uppercase leading-4 tracking-[0.1em] text-zinc-500">
                Returns information at checkout
              </p>
            </div>
          </div>

          <div className="mt-7">
            <h2 className="text-[9px] uppercase tracking-[0.2em] text-zinc-400">
              Available sizes
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <li
                  key={size}
                  className="border border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-zinc-400"
                >
                  {size}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
