import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import {
  getPublishedChapters,
  getPublishedProducts,
  getPublishedSeries,
} from "@/lib/public-content";
import { chapterVisual } from "@/lib/visuals";

async function HomeContent() {
  await connection();
  const seriesList = await getPublishedSeries();
  const series = seriesList[0] ?? null;
  const chapters = series ? await getPublishedChapters(series.id) : [];
  const products = await getPublishedProducts();
  const featuredChapters = chapters.slice(0, 3);

  return (
    <>
      <section className="relative flex min-h-[min(800px,calc(100svh-76px))] items-center overflow-hidden border-b border-white/10">
        <div className="visual-hero absolute inset-0" />
        <div className="relative mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center px-5 py-24 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:py-28">
          <div className="relative z-10 max-w-3xl">
            <p className="mb-8 flex items-center gap-3 text-[9px] uppercase tracking-[0.3em] text-zinc-400 sm:text-[10px]">
              <span className="h-px w-8 bg-zinc-500" />
              An independent study in resilience · Est. 2026
            </p>
            <h1 className="text-[clamp(3.2rem,10vw,8.5rem)] font-semibold uppercase leading-[0.83] tracking-[-0.075em]">
              Wear your
              <br />
              <span className="font-light text-zinc-400">battles.</span>
            </h1>
            <p className="mt-8 max-w-md text-sm leading-7 text-zinc-400 sm:text-base">
              Armor for the modern daily struggle. Quietly considered pieces
              made to move with you through every version of the day.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <Link
                href={series ? `/archive/${series.slug}` : "/archive"}
                className="group inline-flex min-h-12 items-center gap-6 bg-white px-5 text-[9px] font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-zinc-200"
              >
                Discover the collection
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/archive"
                className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-zinc-400 transition hover:text-white"
              >
                Enter the archive <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
          <div className="relative mt-16 hidden aspect-[4/5] max-h-[550px] justify-self-end border border-white/10 lg:flex lg:w-[78%]">
            <div className="visual-editorial absolute inset-0" />
            <div className="absolute inset-5 border border-white/10" />
            <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-[0.24em] text-zinc-400">
                  Field note 001
                </p>
                <p className="mt-2 text-sm uppercase tracking-[0.14em]">
                  The quiet is not empty.
                </p>
              </div>
              <span className="text-[9px] tracking-[0.18em] text-zinc-500">
                01 / 05
              </span>
            </div>
            <span className="absolute right-8 top-8 text-[9px] uppercase tracking-[0.2em] text-zinc-500">
              QB — 001
            </span>
          </div>
          <Link
            href="#philosophy"
            className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[8px] uppercase tracking-[0.22em] text-zinc-500 lg:flex"
          >
            Scroll to explore <ArrowDown size={12} />
          </Link>
        </div>
      </section>

      <section
        id="philosophy"
        className="border-b border-white/10 px-5 py-24 sm:px-8 md:py-36 lg:px-12"
      >
        <div className="mx-auto grid max-w-[1200px] gap-12 md:grid-cols-[0.65fr_1.35fr] md:gap-20">
          <div>
            <p className="text-[9px] uppercase tracking-[0.28em] text-zinc-500">
              The philosophy
            </p>
            <p className="mt-5 text-[10px] uppercase tracking-[0.18em] text-zinc-400">
              {series?.title ?? "Quiet Battles™"}
            </p>
          </div>
          <div>
            <blockquote className="max-w-3xl text-2xl font-light leading-[1.45] tracking-[-0.03em] text-zinc-200 sm:text-3xl md:text-4xl">
              “Every quiet battle fought in isolation leaves an invisible
              armor. We make pieces that honor the strength it takes to keep
              going.”
            </blockquote>
            <p className="mt-8 max-w-xl text-xs leading-6 text-zinc-500">
              We believe clothing can be both protection and expression—never
              a shield from who you are, but a reminder of everything you have
              already carried.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-white/10 pb-6">
            <div>
              <p className="text-[9px] uppercase tracking-[0.26em] text-zinc-500">
                The current release
              </p>
              <h2 className="mt-3 text-xl font-medium uppercase tracking-[-0.02em] sm:text-2xl">
                {series?.title ?? "Series 01 — The Gentle Armor™"}
              </h2>
            </div>
            <Link
              href={series ? `/archive/${series.slug}` : "/archive"}
              className="group inline-flex items-center gap-2 pb-1 text-[9px] uppercase tracking-[0.18em] text-zinc-400 transition hover:text-white"
            >
              {series ? `Explore all ${chapters.length} chapters` : "Explore the archive"}
              <ArrowRight
                size={13}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {featuredChapters.map((chapter, index) => {
              const product = products.find(
                (item) => item.id === chapter.productId,
              );
              return (
                <article key={chapter.id} className="group">
                  <Link
                    href={`/archive/${series?.slug ?? "series-01"}/chapters/${chapter.chapterNumber}`}
                    className={`visual-editorial ${chapterVisual(chapter.chapterNumber)} relative flex aspect-[4/4.5] items-end overflow-hidden border border-white/10`}
                  >
                    <span className="absolute left-5 top-5 text-[9px] uppercase tracking-[0.2em] text-zinc-400">
                      Chapter {String(chapter.chapterNumber).padStart(2, "0")}
                    </span>
                    <span className="absolute right-5 top-5 text-[9px] text-zinc-500">
                      {String(index + 1).padStart(2, "0")} /{" "}
                      {String(featuredChapters.length).padStart(2, "0")}
                    </span>
                    <div className="relative z-10 w-full bg-gradient-to-t from-black/80 to-transparent p-5 pt-20">
                      <p className="text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                        Field note
                      </p>
                      <h3 className="mt-2 text-xl font-medium uppercase tracking-[-0.02em]">
                        {chapter.title}
                      </h3>
                    </div>
                  </Link>
                  <div className="flex items-start justify-between gap-4 py-4">
                    <p className="max-w-[260px] text-xs leading-5 text-zinc-500">
                      {chapter.storyContent.slice(0, 110)}
                    </p>
                    {product && (
                      <span className="shrink-0 text-[10px] text-zinc-400">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <p className="px-6 py-24 text-center text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          Opening the archive…
        </p>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
