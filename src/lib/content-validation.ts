import {
  PRODUCT_SIZES,
  STOCK_STATUSES,
} from "@/models/Product";
import { CONTENT_STATUSES } from "@/models/Series";
import type {
  ContentStatus,
  ProductSize,
  StockStatus,
} from "@/types/content";

export type Resource = "series" | "chapters" | "products";

export interface SeriesInput {
  title: string;
  slug: string;
  description: string;
  releaseYear: number;
  coverImage: string;
  status: ContentStatus;
}

export interface ChapterInput {
  seriesId: string;
  chapterNumber: number;
  title: string;
  storyContent: string;
  imageUrl: string;
  productId: string | null;
  status: ContentStatus;
}

export interface ProductInput {
  name: string;
  slug: string;
  price: number;
  description: string;
  sizes: ProductSize[];
  images: string[];
  stockStatus: StockStatus;
  status: ContentStatus;
}

export class InputError extends Error {}

// Check that a value is a plain object before reading its fields.
function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function assertKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
) {
  // Reject unknown fields so clients cannot update data outside the form.
  const unexpected = Object.keys(value).find((key) => !allowed.includes(key));
  if (unexpected) throw new InputError(`Unexpected field: ${unexpected}.`);
}

// Trim a required text value and check its allowed length.
function requiredText(
  value: unknown,
  field: string,
  maximum: number,
  minimum = 1,
) {
  if (typeof value !== "string") {
    throw new InputError(`${field} must be text.`);
  }
  const text = value.trim();
  if (text.length < minimum || text.length > maximum) {
    throw new InputError(
      `${field} must be between ${minimum} and ${maximum} characters.`,
    );
  }
  return text;
}

function optionalImage(value: unknown, field: string) {
  if (value === undefined || value === null || value === "") return "";
  const image = requiredText(value, field, 2048);
  if (image.startsWith("/") && !image.startsWith("//")) return image;

  // Allow local paths or safe HTTPS URLs for image fields.
  try {
    const url = new URL(image);
    if (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.hash
    ) {
      return url.toString();
    }
  } catch {
    throw new InputError(`${field} must be an HTTPS URL or a local path.`);
  }
  throw new InputError(`${field} must be an HTTPS URL or a local path.`);
}

// Use the requested publication state or the default state.
function contentStatus(value: unknown): ContentStatus {
  if (
    value === undefined ||
    value === CONTENT_STATUSES[0] ||
    value === CONTENT_STATUSES[1]
  ) {
    return value ?? "Published";
  }
  throw new InputError("Status must be Published or Draft.");
}

// Check that a URL slug uses only lowercase letters, numbers, and hyphens.
function requiredSlug(value: unknown) {
  const slug = requiredText(value, "Slug", 120).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new InputError(
      "Slug may contain lowercase letters, numbers, and single hyphens.",
    );
  }
  return slug;
}

// Check that a number is a whole number within the allowed range.
function positiveInteger(value: unknown, field: string, maximum: number) {
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value < 1 ||
    value > maximum
  ) {
    throw new InputError(`${field} must be a whole number from 1 to ${maximum}.`);
  }
  return value;
}

// Validate all fields that can be saved on a Series.
function parseSeries(value: Record<string, unknown>): SeriesInput {
  assertKeys(value, [
    "title",
    "slug",
    "description",
    "releaseYear",
    "coverImage",
    "status",
  ]);
  const year = value.releaseYear;
  if (
    typeof year !== "number" ||
    !Number.isSafeInteger(year) ||
    year < 1900 ||
    year > 2200
  ) {
    throw new InputError("Release year must be a whole year from 1900 to 2200.");
  }
  return {
    title: requiredText(value.title, "Title", 120),
    slug: requiredSlug(value.slug),
    description: requiredText(value.description, "Description", 2000),
    releaseYear: year,
    coverImage: optionalImage(value.coverImage, "Cover image"),
    status: contentStatus(value.status),
  };
}

// Validate all fields and database references for a Chapter.
function parseChapter(value: Record<string, unknown>): ChapterInput {
  assertKeys(value, [
    "seriesId",
    "chapterNumber",
    "title",
    "storyContent",
    "imageUrl",
    "productId",
    "status",
  ]);
  const seriesId = requiredText(value.seriesId, "Series", 24);
  const productId =
    value.productId === undefined || value.productId === null || value.productId === ""
      ? null
      : requiredText(value.productId, "Product", 24);
  return {
    seriesId,
    chapterNumber: positiveInteger(value.chapterNumber, "Chapter number", 999),
    title: requiredText(value.title, "Title", 120),
    storyContent: requiredText(value.storyContent, "Story", 12000),
    imageUrl: optionalImage(value.imageUrl, "Chapter image"),
    productId,
    status: contentStatus(value.status),
  };
}

// Validate product details, sizes, images, and stock status.
function parseProduct(value: Record<string, unknown>): ProductInput {
  assertKeys(value, [
    "name",
    "slug",
    "price",
    "description",
    "sizes",
    "images",
    "stockStatus",
    "status",
  ]);
  const price = value.price;
  if (
    typeof price !== "number" ||
    !Number.isSafeInteger(price) ||
    price < 1 ||
    price > 1000000
  ) {
    throw new InputError("Price must be a whole number from 1 to 1,000,000.");
  }
  if (
    !Array.isArray(value.sizes) ||
    value.sizes.length === 0 ||
    value.sizes.some(
      (size) => typeof size !== "string" || !PRODUCT_SIZES.includes(size as ProductSize),
    ) ||
    new Set(value.sizes).size !== value.sizes.length
  ) {
    throw new InputError("Choose one or more unique valid sizes.");
  }
  if (
    value.stockStatus !== undefined &&
    !STOCK_STATUSES.includes(value.stockStatus as StockStatus)
  ) {
    throw new InputError("Choose a valid stock status.");
  }
  if (
    value.images !== undefined &&
    (!Array.isArray(value.images) || value.images.length > 10)
  ) {
    throw new InputError("A product can have up to 10 image URLs.");
  }

  const images = (value.images ?? []).map((image, index) =>
    optionalImage(image, `Image ${index + 1}`),
  );
  return {
    name: requiredText(value.name, "Name", 120),
    slug: requiredSlug(value.slug),
    price,
    description: requiredText(value.description, "Description", 2000),
    sizes: value.sizes as ProductSize[],
    images,
    stockStatus: (value.stockStatus ?? "In stock") as StockStatus,
    status: contentStatus(value.status),
  };
}

// Check a request body using the rules for its selected collection.
export function parseContentInput(
  resource: "series",
  input: unknown,
): SeriesInput;
export function parseContentInput(
  resource: "chapters",
  input: unknown,
): ChapterInput;
export function parseContentInput(
  resource: "products",
  input: unknown,
): ProductInput;
export function parseContentInput(
  resource: Resource,
  input: unknown,
): SeriesInput | ChapterInput | ProductInput {
  // Parse only known shapes before Mongoose sees client-controlled data.
  if (!isRecord(input)) throw new InputError("Request body must be an object.");
  if (resource === "series") return parseSeries(input);
  if (resource === "chapters") return parseChapter(input);
  return parseProduct(input);
}

// Accept only the three collections that the admin API supports.
export function parseResource(value: string): Resource | null {
  return value === "series" || value === "chapters" || value === "products"
    ? value
    : null;
}
