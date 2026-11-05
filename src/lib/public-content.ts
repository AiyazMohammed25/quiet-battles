import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { ChapterModel } from "@/models/Chapter";
import { ProductModel } from "@/models/Product";
import { SeriesModel } from "@/models/Series";
import type {
  ChapterContent,
  ChapterWithProduct,
  ProductContent,
  SeriesContent,
} from "@/types/content";

function toSeries(document: {
  _id: { toString(): string };
  title: string;
  slug: string;
  description: string;
  releaseYear: number;
  coverImage: string;
  status: "Published" | "Draft";
}): SeriesContent {
  return {
    id: document._id.toString(),
    title: document.title,
    slug: document.slug,
    description: document.description,
    releaseYear: document.releaseYear,
    coverImage: document.coverImage,
    status: document.status,
  };
}

function toChapter(document: {
  _id: { toString(): string };
  seriesId: { toString(): string };
  chapterNumber: number;
  title: string;
  storyContent: string;
  imageUrl: string;
  productId: { toString(): string } | null;
  status: "Published" | "Draft";
}): ChapterContent {
  return {
    id: document._id.toString(),
    seriesId: document.seriesId.toString(),
    chapterNumber: document.chapterNumber,
    title: document.title,
    storyContent: document.storyContent,
    imageUrl: document.imageUrl,
    productId: document.productId?.toString() ?? null,
    status: document.status,
  };
}

function toProduct(document: {
  _id: { toString(): string };
  name: string;
  slug: string;
  price: number;
  description: string;
  sizes: ("S" | "M" | "L" | "XL" | "XXL")[];
  images: string[];
  stockStatus: "In stock" | "Out of stock" | "Pre-order";
  status: "Published" | "Draft";
}): ProductContent {
  return {
    id: document._id.toString(),
    name: document.name,
    slug: document.slug,
    price: document.price,
    description: document.description,
    sizes: document.sizes,
    images: document.images,
    stockStatus: document.stockStatus,
    status: document.status,
  };
}

export async function getPublishedSeries() {
  await connectToDatabase();
  const documents = await SeriesModel.find({ status: "Published" })
    .sort({ releaseYear: -1, createdAt: -1 })
    .lean();
  return documents.map(toSeries);
}

export async function getPublishedSeriesBySlug(slug: string) {
  await connectToDatabase();
  const document = await SeriesModel.findOne({
    slug,
    status: "Published",
  }).lean();
  return document ? toSeries(document) : null;
}

export async function getPublishedChapters(seriesId: string) {
  await connectToDatabase();
  const documents = await ChapterModel.find({
    seriesId,
    status: "Published",
  })
    .sort({ chapterNumber: 1 })
    .lean();
  return documents.map(toChapter);
}

export async function getPublishedChapter(
  seriesId: string,
  chapterNumber: number,
): Promise<ChapterWithProduct | null> {
  await connectToDatabase();
  // Resolve the chapter and its optional published product together for the story's product callout.
  const document = await ChapterModel.findOne({
    seriesId,
    chapterNumber,
    status: "Published",
  }).lean();
  if (!document) return null;

  const chapter = toChapter(document);
  const productDocument = document.productId
    ? await ProductModel.findOne({
        _id: document.productId,
        status: "Published",
      }).lean()
    : null;

  return {
    ...chapter,
    product: productDocument ? toProduct(productDocument) : null,
  };
}

export async function getPublishedProducts() {
  await connectToDatabase();
  const documents = await ProductModel.find({ status: "Published" })
    .sort({ createdAt: -1 })
    .lean();
  return documents.map(toProduct);
}

export async function getPublishedProductBySlug(slug: string) {
  await connectToDatabase();
  const document = await ProductModel.findOne({
    slug,
    status: "Published",
  }).lean();
  return document ? toProduct(document) : null;
}

export async function getPublishedChapterCounts(seriesIds: string[]) {
  await connectToDatabase();
  const objectIds = seriesIds.map((id) => new Types.ObjectId(id));
  // Mongo stores references as ObjectIds, so convert the serialized IDs before grouping chapter counts.
  const counts = await ChapterModel.aggregate<{
    _id: { toString(): string };
    count: number;
  }>([
    { $match: { seriesId: { $in: objectIds }, status: "Published" } },
    { $group: { _id: "$seriesId", count: { $sum: 1 } } },
  ]);
  return new Map(counts.map((entry) => [entry._id.toString(), entry.count]));
}
