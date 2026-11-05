import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1fr_auto] md:items-end lg:px-12">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em]">
            Quiet Battles<span className="text-zinc-500">™</span>
          </p>
          <p className="max-w-md text-xs leading-6 text-zinc-500">
            Made for the battles you carry quietly. Wear your battles.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-7 gap-y-3 text-[10px] uppercase tracking-[0.18em] text-zinc-400">
          <Link href="/archive" className="transition hover:text-white">
            Archive
          </Link>
          <Link
            href="/archive/series-01"
            className="transition hover:text-white"
          >
            Series 01
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 transition hover:text-white"
          >
            Studio <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>
      <div className="border-t border-white/5 px-5 py-4 text-center text-[9px] uppercase tracking-[0.2em] text-zinc-600">
        © 2026 Quiet Battles™. A study in resilience.
      </div>
    </footer>
  );
}
