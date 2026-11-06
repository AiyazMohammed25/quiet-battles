import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  getPublishedChapter,
  getPublishedChapters,
  getPublishedSeriesBySlug,
} from "@/lib/public-content";
import { chapterVisual } from "@/lib/visuals";

export const metadata: Metadata = {
  title: "Chapter — The Gentle Armor",
};

// Load a chapter, its story, and its linked product for this URL.
async function ChapterContent({
  params,
}: {
  params: Promise<{ seriesId: string; chapterId: string }>;
}) {
  // Dynamic route params are promises in current Next.js versions and must be awaited.
  const { seriesId, chapterId } = await params;
  const chapterNumber = Number(chapterId);
  if (!/^\d+$/.test(chapterId) || !Number.isSafeInteger(chapterNumber)) {
    notFound();
  }

  await connection();
  const series = await getPublishedSeriesBySlug(seriesId);
  if (!series) notFound();

  const chapters = await getPublishedChapters(series.id);
  const chapter = await getPublishedChapter(series.id, chapterNumber);
  if (!chapter) notFound();
  const chapterIndex = chapters.findIndex(
    (item) => item.chapterNumber === chapter.chapterNumber,
  );

  const storyParagraphs = chapter.storyContent
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <article className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8 md:py-14 lg:px-12">
      <Link
        href={`/archive/${series.slug}`}
        className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-zinc-500 transition hover:text-white"
      >
        <ArrowLeft size={13} /> Back to {series.title}
      </Link>

      <header className="mx-auto mt-12 max-w-3xl border-b border-white/10 pb-9 md:mt-16">
        <p className="text-[9px] uppercase tracking-[0.25em] text-zinc-500">
          Chapter {String(chapter.chapterNumber).padStart(2, "0")} / Narrative
          archive
        </p>
        <h1 className="mt-5 text-4xl font-medium uppercase leading-[0.98] tracking-[-0.06em] sm:text-6xl">
          {chapter.title}
        </h1>
      </header>

      <div
        className={`visual-editorial ${chapterVisual(chapter.chapterNumber)} relative mx-auto mt-10 flex aspect-[16/9] max-h-[560px] items-end border border-white/10 sm:mt-14`}
        role="img"
        aria-label={`Editorial artwork for ${chapter.title}`}
      >
        <span className="absolute left-5 top-5 text-[9px] uppercase tracking-[0.2em] text-zinc-500 sm:left-8 sm:top-8">
          QB / Field notes / {String(chapter.chapterNumber).padStart(2, "0")}
        </span>
        <div className="relative z-10 flex w-full items-end justify-between bg-gradient-to-t from-black/60 to-transparent p-5 pt-20 sm:p-8">
          <p className="max-w-md text-xs uppercase leading-6 tracking-[0.12em] text-zinc-300 sm:text-sm">
            {chapter.title}
            <br />
            <span className="text-zinc-500">A study in quiet resilience</span>
          </p>
          <span className="text-[9px] tracking-[0.16em] text-zinc-500">
            {String(chapter.chapterNumber).padStart(2, "0")} /{" "}
            {String(chapters.length).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="mx-auto grid max-w-4xl gap-10 py-12 md:grid-cols-[0.35fr_0.65fr] md:gap-16 md:py-16">
        <aside>
          <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500">
            The story
          </p>
          <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-zinc-300">
            {series.title}
          </p>
        </aside>
        <div className="space-y-6">
          {storyParagraphs.map((paragraph, index) => (
            <p
              key={`${index}-${paragraph.slice(0, 20)}`}
              className="text-sm leading-7 text-zinc-300 sm:text-base sm:leading-8"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {chapter.product && (
        <section className="mx-auto max-w-4xl border-y border-white/10 py-7 sm:py-9">
          <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="text-[9px] uppercase tracking-[0.22em] text-zinc-500">
                The piece behind this chapter
              </p>
              <h2 className="mt-3 text-xl font-medium uppercase tracking-[-0.02em] sm:text-2xl">
                {chapter.product.name}
              </h2>
              <p className="mt-2 text-xs text-zinc-400">
                {chapter.product.stockStatus}
                <span className="px-2 text-zinc-600">/</span>₹
                {chapter.product.price.toLocaleString("en-IN")}
              </p>
            </div>
            <Link
              href={`/products/${chapter.product.slug}`}
              className="inline-flex min-h-12 items-center justify-center gap-4 bg-white px-5 text-[9px] font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-zinc-200"
            >
              Discover the piece <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}

      <nav
        aria-label="Chapter navigation"
        className="mx-auto mt-8 flex max-w-4xl justify-between text-[9px] uppercase tracking-[0.16em] text-zinc-500"
      >
        {chapterIndex > 0 ? (
          <Link
            href={`/archive/${series.slug}/chapters/${chapters[chapterIndex - 1].chapterNumber}`}
            className="transition hover:text-white"
          >
            ← Previous chapter
          </Link>
        ) : (
          <span />
        )}
        {chapterIndex >= 0 && chapterIndex < chapters.length - 1 && (
          <Link
            href={`/archive/${series.slug}/chapters/${chapters[chapterIndex + 1].chapterNumber}`}
            className="transition hover:text-white"
          >
            Next chapter →
          </Link>
        )}
      </nav>
    </article>
  );
}

// Show the chapter page with a loading message while data is fetched.
export default function ChapterPage({
  params,
}: {
  params: Promise<{ seriesId: string; chapterId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <p className="px-6 py-24 text-center text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          Opening the chapter…
        </p>
      }
    >
      <ChapterContent params={params} />
    </Suspense>
  );
}
