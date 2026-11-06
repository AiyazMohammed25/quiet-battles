import { model, models, Schema } from "mongoose";
import { CONTENT_STATUSES } from "@/models/Series";

export const PRODUCT_SIZES = ["S", "M", "L", "XL", "XXL"] as const;
export const STOCK_STATUSES = ["In stock", "Out of stock", "Pre-order"] as const;

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      maxlength: 120,
      unique: true,
    },
    price: { type: Number, required: true, min: 1, max: 1000000 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    sizes: {
      type: [{ type: String, enum: PRODUCT_SIZES }],
      required: true,
      validate: {
        // Require at least one size and prevent duplicate sizes.
        validator: (sizes: string[]) =>
          sizes.length > 0 && new Set(sizes).size === sizes.length,
        message: "Choose at least one unique size.",
      },
    },
    images: {
      type: [{ type: String, trim: true, maxlength: 2048 }],
      required: true,
      default: [],
    },
    stockStatus: {
      type: String,
      enum: STOCK_STATUSES,
      required: true,
      default: "In stock",
    },
    status: {
      type: String,
      enum: CONTENT_STATUSES,
      required: true,
      default: "Published",
    },
  },
  { timestamps: true, strict: "throw" },
);

export const ProductModel =
  models.Product ?? model("Product", productSchema);
