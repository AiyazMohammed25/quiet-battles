import { model, models, Schema } from "mongoose";

export const CONTENT_STATUSES = ["Published", "Draft"] as const;

const seriesSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      maxlength: 120,
      unique: true,
    },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    releaseYear: { type: Number, required: true, min: 1900, max: 2200 },
    coverImage: { type: String, trim: true, maxlength: 2048, default: "" },
    status: {
      type: String,
      enum: CONTENT_STATUSES,
      required: true,
      default: "Published",
    },
  },
  { timestamps: true, strict: "throw" },
);

export const SeriesModel =
  models.Series ?? model("Series", seriesSchema);
