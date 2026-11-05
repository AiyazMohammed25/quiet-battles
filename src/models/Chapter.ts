import { model, models, Schema, Types } from "mongoose";
import { CONTENT_STATUSES } from "@/models/Series";

const chapterSchema = new Schema(
  {
    seriesId: {
      type: Schema.Types.ObjectId,
      ref: "Series",
      required: true,
      index: true,
    },
    chapterNumber: { type: Number, required: true, min: 1, max: 999 },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    storyContent: { type: String, required: true, trim: true, maxlength: 12000 },
    imageUrl: { type: String, trim: true, maxlength: 2048, default: "" },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      default: null,
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

chapterSchema.index({ seriesId: 1, chapterNumber: 1 }, { unique: true });

export interface ChapterDocument {
  _id: Types.ObjectId;
  seriesId: Types.ObjectId;
  chapterNumber: number;
  title: string;
  storyContent: string;
  imageUrl: string;
  productId: Types.ObjectId | null;
  status: (typeof CONTENT_STATUSES)[number];
}

export const ChapterModel =
  models.Chapter ?? model("Chapter", chapterSchema);
