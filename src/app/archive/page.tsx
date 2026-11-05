import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getPublishedChapterCounts, getPublishedSeries } from "@/lib/public-content";

async function ArchiveContent() {
  await connection();
  const seriesList = await getPublishedSeries();
  const chapterCounts = await getPublishedChapterCounts(
    seriesList.map((series) => series.id),
  );

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 md:py-24 lg:px-12">
      <header className="grid gap-8 border-b border-white/10 pb-10 md:grid-cols-[1fr_0.6fr] md:items-end md:pb-14">
        <div>
          <p className="text-[9px] uppercase tracking-[0.28em] text-zinc-500">
            Quiet Battles™ / Archive
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-medium uppercase leading-[0.98] tracking-[-0.06em] sm:text-6xl">
            A record of
            <br />
            <span className="text-zinc-500">what we carry.</span>
          </h1>
        </div>
        <p className="max-w-lg text-sm leading-7 text-zinc-400 md:justify-self-end">
          Collections shaped by the things that ask us to endure. Each release
          is a chapter in a longer conversation about protection, purpose, and
          personal resilience.
        </p>
      </header>

      <section className="grid gap-6 pt-10 md:grid-cols-2">
        {seriesList.map((series, index) => (
          <Link
            key={series.id}
            href={`/archive/${series.slug}`}
            className="group grid overflow-hidden border border-white/10 transition hover:border-white/30 md:grid-cols-[1.1fr_0.9fr]"
          >
            <div className="visual-editorial visual-genesis relative flex min-h-[340px] flex-col justify-between p-6 sm:min-h-[440px] sm:p-9">
              <div className="relative z-10 flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-zinc-400">
                <span>Collection {String(index + 1).padStart(3, "0")}</span>
                <span>{chapterCounts.get(series.id) ?? 0} chapters</span>
              </div>
              <span className="relative z-10 self-end text-[clamp(4rem,11vw,9rem)] font-light leading-none tracking-[-0.1em] text-white/10">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="flex flex-col justify-between bg-[#101010] p-7 sm:p-10">
              <div>
                <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-zinc-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  Now in the archive
                </div>
                <h2 className="mt-7 max-w-md text-3xl font-medium uppercase leading-tight tracking-[-0.04em] sm:text-4xl">
                  {series.title}
                </h2>
                <p className="mt-5 max-w-md text-xs leading-6 text-zinc-400">
                  {series.description}
                </p>
                <p className="mt-7 text-[9px] uppercase tracking-[0.17em] text-zinc-500">
                  Released {series.releaseYear}
                </p>
              </div>
              <span className="mt-10 inline-flex items-center gap-3 text-[9px] uppercase tracking-[0.2em] text-zinc-200">
                Enter the collection
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            </div>
          </Link>
        ))}
        {seriesList.length === 0 && (
          <p className="border border-white/10 px-6 py-12 text-xs text-zinc-500">
            No published series yet. The archive will appear here when a
            collection is published.
          </p>
        )}
      </section>

      <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
        <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500">
          Archive index / {String(seriesList.length).padStart(3, "0")}
        </p>
        <Link
          href={seriesList[0] ? `/archive/${seriesList[0].slug}` : "/archive"}
          className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-zinc-400 hover:text-white"
        >
          Explore the release <ArrowUpRight size={13} />
        </Link>
      </div>
    </div>
  );
}

export default function ArchivePage() {
  return (
    <Suspense
      fallback={
        <p className="px-6 py-24 text-center text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          Opening the archive…
        </p>
      }
    >
      <ArchiveContent />
    </Suspense>
  );
}