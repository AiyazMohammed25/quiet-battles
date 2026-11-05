import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import {
  getPublishedChapters,
  getPublishedSeriesBySlug,
} from "@/lib/public-content";
import { chapterVisual } from "@/lib/visuals";

export const metadata: Metadata = {
  title: "Series 01 — The Gentle Armor",
};

async function SeriesContent({
  params,
}: {
  params: Promise<{ seriesId: string }>;
}) {
  await connection();
  const { seriesId } = await params;
  const series = await getPublishedSeriesBySlug(seriesId);
  if (!series) notFound();
  const chapters = await getPublishedChapters(series.id);

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 md:py-24 lg:px-12">
      <header className="grid gap-8 border-b border-white/10 pb-10 md:grid-cols-[1.15fr_0.85fr] md:items-end md:pb-14">
        <div>
          <p className="text-[9px] uppercase tracking-[0.28em] text-zinc-500">
            Archive / Collection 001
          </p>
          <h1 className="mt-5 text-4xl font-medium uppercase leading-[0.98] tracking-[-0.06em] sm:text-6xl">
            {series.title}
          </h1>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
            Series / Est. {series.releaseYear}
          </p>
          <p className="mt-4 max-w-lg text-sm leading-7 text-zinc-400">
            {series.description}
          </p>
          <p className="mt-5 text-[9px] uppercase tracking-[0.17em] text-zinc-600">
            {chapters.length} chapters <span className="px-2">·</span>{" "}
            {series.releaseYear}
          </p>
        </div>
      </header>

      <section
        aria-label={`${series.title} chapters`}
        className="grid gap-x-5 gap-y-10 pt-10 sm:grid-cols-2 lg:grid-cols-3"
      >
        {chapters.map((chapter, index) => (
          <article key={chapter.id} className="group">
            <Link
              href={`/archive/${seriesId}/chapters/${chapter.chapterNumber}`}
              className={`visual-editorial ${chapterVisual(chapter.chapterNumber)} relative flex aspect-[4/4.5] items-end overflow-hidden border border-white/10 transition group-hover:border-white/30`}
            >
              <span className="absolute left-5 top-5 text-[9px] uppercase tracking-[0.2em] text-zinc-400">
                Chapter {String(chapter.chapterNumber).padStart(2, "0")}
              </span>
              <span className="absolute right-5 top-5 text-[9px] tracking-[0.16em] text-zinc-500">
                {String(index + 1).padStart(2, "0")} /{" "}
                {String(chapters.length).padStart(2, "0")}
              </span>
              <div className="relative z-10 w-full bg-gradient-to-t from-black/80 to-transparent p-5 pt-20">
                <p className="text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                  Field note
                </p>
                <h2 className="mt-2 text-xl font-medium uppercase tracking-[-0.02em]">
                  {chapter.title}
                </h2>
              </div>
              <span className="absolute bottom-5 right-5 z-10 flex h-9 w-9 items-center justify-center border border-white/20 text-white/70 transition group-hover:bg-white group-hover:text-black">
                <ArrowRight size={14} />
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-xs leading-5 text-zinc-500">
              {chapter.storyContent.slice(0, 150)}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}

export default function SeriesPage({
  params,
}: {
  params: Promise<{ seriesId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <p className="px-6 py-24 text-center text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          Opening the collection…
        </p>
      }
    >
      <SeriesContent params={params} />
    </Suspense>
  );
}
