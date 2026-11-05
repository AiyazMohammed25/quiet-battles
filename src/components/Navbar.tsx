"use client";

import Link from "next/link";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";

const links = [
  { href: "/", label: "Home" },
  { href: "/archive", label: "The Archive" },
  { href: "/archive/series-01", label: "Series 01" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const itemCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );
  const toggleCart = useCartStore((state) => state.toggleCart);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="text-sm font-bold uppercase tracking-[0.18em] text-white sm:text-base"
          onClick={() => setMobileMenuOpen(false)}
        >
          Quiet Battles<span className="text-zinc-500">™</span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-9 md:flex"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/admin"
            className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 transition hover:text-zinc-300"
          >
            Studio
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleCart(true)}
            className="relative flex h-11 min-w-11 items-center justify-center text-zinc-200 transition hover:text-white"
            aria-label={`Open bag, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
            <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[9px] font-bold text-black">
              {itemCount}
            </span>
          </button>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center text-zinc-200 md:hidden"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-white/10 bg-[#0a0a0a] px-6 py-5 md:hidden"
        >
          {[...links, { href: "/admin", label: "Studio" }].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block border-b border-white/5 py-4 text-[11px] uppercase tracking-[0.2em] text-zinc-300 last:border-0"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}