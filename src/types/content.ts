export type ContentStatus = "Published" | "Draft";
export type StockStatus = "In stock" | "Out of stock" | "Pre-order";
export type ProductSize = "S" | "M" | "L" | "XL" | "XXL";

export interface SeriesContent {
  id: string;
  title: string;
  slug: string;
  description: string;
  releaseYear: number;
  coverImage: string;
  status: ContentStatus;
}

export interface ChapterContent {
  id: string;
  seriesId: string;
  chapterNumber: number;
  title: string;
  storyContent: string;
  imageUrl: string;
  productId: string | null;
  status: ContentStatus;
}

export interface ProductContent {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  sizes: ProductSize[];
  images: string[];
  stockStatus: StockStatus;
  status: ContentStatus;
}

export interface ChapterWithProduct extends ChapterContent {
  product: ProductContent | null;
}
