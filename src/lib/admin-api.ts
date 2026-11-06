import { Types } from "mongoose";
import { NextResponse, type NextRequest } from "next/server";
import { ChapterModel } from "@/models/Chapter";
import { ProductModel } from "@/models/Product";
import { SeriesModel } from "@/models/Series";
import { isAdminAuthenticated, requireSameOrigin, unauthorizedResponse } from "@/lib/auth";
import { errorResponse, readJsonBody } from "@/lib/api-response";
import {
  InputError,
  parseContentInput,
  type ChapterInput,
  type Resource,
} from "@/lib/content-validation";
import { connectToDatabase } from "@/lib/db";

function authorize(request: NextRequest, mutating = false) {
  // Check the session and, for writes, confirm the request came from this site.
  if (mutating) {
    const originError = requireSameOrigin(request);
    if (originError) return originError;
  }
  if (!isAdminAuthenticated(request)) return unauthorizedResponse();
  return null;
}

// Convert a MongoDB Series document into a safe JSON response.
function serializeSeries(document: {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  releaseYear: number;
  coverImage: string;
  status: "Published" | "Draft";
}) {
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

// Convert MongoDB references and fields into a safe Chapter response.
function serializeChapter(document: {
  _id: Types.ObjectId;
  seriesId: Types.ObjectId;
  chapterNumber: number;
  title: string;
  storyContent: string;
  imageUrl: string;
  productId: Types.ObjectId | null;
  status: "Published" | "Draft";
}) {
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

// Convert a MongoDB Product document into a safe JSON response.
function serializeProduct(document: {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  price: number;
  description: string;
  sizes: string[];
  images: string[];
  stockStatus: "In stock" | "Out of stock" | "Pre-order";
  status: "Published" | "Draft";
}) {
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

// Return every record in the selected collection to a signed-in admin.
export async function listAdminContent(
  request: NextRequest,
  resource: Resource,
) {
  const denied = authorize(request);
  if (denied) return denied;

  try {
    await connectToDatabase();
    if (resource === "series") {
      const documents = await SeriesModel.find().sort({ createdAt: -1 }).lean();
      return NextResponse.json({ data: documents.map(serializeSeries) });
    }
    if (resource === "chapters") {
      const documents = await ChapterModel.find()
        .sort({ seriesId: 1, chapterNumber: 1 })
        .lean();
      return NextResponse.json({ data: documents.map(serializeChapter) });
    }
    const documents = await ProductModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ data: documents.map(serializeProduct) });
  } catch (error) {
    return errorResponse(error);
  }
}

// Check that a chapter's selected Series and optional Product still exist.
async function validateChapterReferences(input: ChapterInput) {
  if (!Types.ObjectId.isValid(input.seriesId)) {
    throw new InputError("Select a valid series.");
  }
  if (!(await SeriesModel.exists({ _id: input.seriesId }))) {
    throw new InputError("The selected series no longer exists.");
  }
  if (input.productId) {
    if (!Types.ObjectId.isValid(input.productId)) {
      throw new InputError("Select a valid product.");
    }
    if (!(await ProductModel.exists({ _id: input.productId }))) {
      throw new InputError("The selected product no longer exists.");
    }
  }
}

// Validate and save a new Series, Chapter, or Product.
export async function createAdminContent(
  request: NextRequest,
  resource: Resource,
) {
  const denied = authorize(request, true);
  if (denied) return denied;

  try {
    const body = await readJsonBody(request);
    await connectToDatabase();

    if (resource === "series") {
      const input = parseContentInput("series", body);
      const created = await SeriesModel.create(input);
      return NextResponse.json(
        { data: serializeSeries(created.toObject()) },
        { status: 201 },
      );
    }
    if (resource === "chapters") {
      const input = parseContentInput("chapters", body);
      await validateChapterReferences(input);
      const created = await ChapterModel.create({
        ...input,
        seriesId: new Types.ObjectId(input.seriesId),
        productId: input.productId
          ? new Types.ObjectId(input.productId)
          : null,
      });
      return NextResponse.json(
        { data: serializeChapter(created.toObject()) },
        { status: 201 },
      );
    }

    const input = parseContentInput("products", body);
    const created = await ProductModel.create(input);
    return NextResponse.json(
      { data: serializeProduct(created.toObject()) },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

// Return one admin record after checking the ID and session.
export async function getAdminContent(
  request: NextRequest,
  resource: Resource,
  id: string,
) {
  const denied = authorize(request);
  if (denied) return denied;
  if (!/^[\da-f]{24}$/i.test(id)) {
    return NextResponse.json({ error: "Record not found." }, { status: 404 });
  }

  try {
    await connectToDatabase();

    if (resource === "series") {
      const document = await SeriesModel.findById(id).lean();
      if (!document) {
        return NextResponse.json({ error: "Record not found." }, { status: 404 });
      }
      return NextResponse.json({ data: serializeSeries(document) });
    }
    if (resource === "chapters") {
      const document = await ChapterModel.findById(id).lean();
      if (!document) {
        return NextResponse.json({ error: "Record not found." }, { status: 404 });
      }
      return NextResponse.json({ data: serializeChapter(document) });
    }

    const document = await ProductModel.findById(id).lean();
    if (!document) {
      return NextResponse.json({ error: "Record not found." }, { status: 404 });
    }
    return NextResponse.json({ data: serializeProduct(document) });
  } catch (error) {
    return errorResponse(error);
  }
}

// Validate the submitted fields and update one existing admin record.
export async function updateAdminContent(
  request: NextRequest,
  resource: Resource,
  id: string,
) {
  const denied = authorize(request, true);
  if (denied) return denied;
  if (!/^[\da-f]{24}$/i.test(id)) {
    return NextResponse.json({ error: "Record not found." }, { status: 404 });
  }

  try {
    const body = await readJsonBody(request);
    await connectToDatabase();

    let updated:
      | ReturnType<typeof serializeSeries>
      | ReturnType<typeof serializeChapter>
      | ReturnType<typeof serializeProduct>
      | null;

    if (resource === "series") {
      const input = parseContentInput("series", body);
      const document = await SeriesModel.findByIdAndUpdate(id, input, {
        returnDocument: "after",
        runValidators: true,
      }).lean();
      updated = document ? serializeSeries(document) : null;
    } else if (resource === "chapters") {
      const input = parseContentInput("chapters", body);
      await validateChapterReferences(input);
      const document = await ChapterModel.findByIdAndUpdate(
        id,
        {
          ...input,
          seriesId: new Types.ObjectId(input.seriesId),
          productId: input.productId
            ? new Types.ObjectId(input.productId)
            : null,
        },
        { returnDocument: "after", runValidators: true },
      ).lean();
      updated = document ? serializeChapter(document) : null;
    } else {
      const input = parseContentInput("products", body);
      const document = await ProductModel.findByIdAndUpdate(id, input, {
        returnDocument: "after",
        runValidators: true,
      }).lean();
      updated = document ? serializeProduct(document) : null;
    }

    if (!updated) {
      return NextResponse.json({ error: "Record not found." }, { status: 404 });
    }
    return NextResponse.json({ data: updated });
  } catch (error) {
    return errorResponse(error);
  }
}

// Delete one admin record and prevent broken chapter references.
export async function deleteAdminContent(
  request: NextRequest,
  resource: Resource,
  id: string,
) {
  const denied = authorize(request, true);
  if (denied) return denied;
  if (!/^[\da-f]{24}$/i.test(id)) {
    return NextResponse.json({ error: "Record not found." }, { status: 404 });
  }

  try {
    await connectToDatabase();

    // Keep references valid: a series with chapters is protected, while product removal clears its chapter links.
    if (resource === "series") {
      if (await ChapterModel.exists({ seriesId: id })) {
        return NextResponse.json(
          { error: "Delete or move this series' chapters before deleting it." },
          { status: 409 },
        );
      }
      const deleted = await SeriesModel.findByIdAndDelete(id).lean();
      if (!deleted) {
        return NextResponse.json({ error: "Record not found." }, { status: 404 });
      }
    } else if (resource === "chapters") {
      const deleted = await ChapterModel.findByIdAndDelete(id).lean();
      if (!deleted) {
        return NextResponse.json({ error: "Record not found." }, { status: 404 });
      }
    } else {
      const deleted = await ProductModel.findByIdAndDelete(id).lean();
      if (!deleted) {
        return NextResponse.json({ error: "Record not found." }, { status: 404 });
      }
      await ChapterModel.updateMany(
        { productId: deleted._id },
        { $set: { productId: null } },
      );
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}
