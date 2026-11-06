import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";
import { CHAPTERS, PRODUCTS, SERIES_01 } from "@/data/catalog";
import {
  connectToDatabase,
  DatabaseConfigurationError,
} from "@/lib/db";
import { ChapterModel } from "@/models/Chapter";
import { ProductModel } from "@/models/Product";
import { SeriesModel } from "@/models/Series";

// Add starter records that are missing without replacing admin changes.
async function seedCatalog() {
  loadEnvConfig(process.cwd());
  await connectToDatabase();

  // Insert starter data only when it does not exist, preserving later admin edits.
  const series = await SeriesModel.findOneAndUpdate(
    { slug: SERIES_01.id },
    {
      $setOnInsert: {
        title: SERIES_01.title,
        slug: SERIES_01.id,
        description: SERIES_01.description,
        releaseYear: 2026,
        coverImage: "",
        status: "Published",
      },
    },
    { upsert: true, returnDocument: "after", runValidators: true },
  );

  const productIds = new Map<string, mongoose.Types.ObjectId>();
  for (const product of PRODUCTS) {
    const savedProduct = await ProductModel.findOneAndUpdate(
      { slug: product.id },
      {
        $setOnInsert: {
          name: product.name,
          slug: product.id,
          price: product.price,
          description: product.description,
          sizes: ["S", "M", "L", "XL", "XXL"],
          images: [],
          stockStatus: "In stock",
          status: "Published",
        },
      },
      { upsert: true, returnDocument: "after", runValidators: true },
    );
    productIds.set(product.id, savedProduct._id);
  }

  for (const chapter of CHAPTERS) {
    const productId = productIds.get(chapter.productId);
    if (!productId) {
      throw new Error(`Seed product is missing for chapter ${chapter.id}.`);
    }

    await ChapterModel.findOneAndUpdate(
      { seriesId: series._id, chapterNumber: Number(chapter.id) },
      {
        $setOnInsert: {
          seriesId: series._id,
          chapterNumber: Number(chapter.id),
          title: chapter.title,
          storyContent: chapter.story.join("\n\n"),
          imageUrl: "",
          productId,
          status: "Published",
        },
      },
      { upsert: true, returnDocument: "after", runValidators: true },
    );
  }
}

seedCatalog()
  .then(async () => {
    console.info("Starter catalog is ready. Existing records were preserved.");
    await mongoose.disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(
      "Could not seed the starter catalog:",
      error instanceof DatabaseConfigurationError
        ? error.message
        : error instanceof Error
          ? error.name
          : "UnknownError",
    );
    await mongoose.disconnect();
    process.exitCode = 1;
  });
