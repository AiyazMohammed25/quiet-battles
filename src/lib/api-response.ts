import { Error as MongooseError } from "mongoose";
import { NextResponse } from "next/server";
import { InputError } from "@/lib/content-validation";

export function errorResponse(error: unknown) {
  if (error instanceof InputError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (
    error instanceof MongooseError.ValidationError ||
    error instanceof MongooseError.CastError
  ) {
    return NextResponse.json(
      { error: "The submitted content is invalid." },
      { status: 400 },
    );
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  ) {
    return NextResponse.json(
      { error: "A record with that slug or chapter number already exists." },
      { status: 409 },
    );
  }

  console.error(
    "Admin API request failed:",
    error instanceof Error ? error.name : "UnknownError",
  );
  return NextResponse.json(
    { error: "The request could not be completed. Check the server logs." },
    { status: 500 },
  );
}

export async function readJsonBody(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 64 * 1024) {
    throw new InputError("Request body must be smaller than 64 KB.");
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > 64 * 1024) {
    throw new InputError("Request body must be smaller than 64 KB.");
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new InputError("Request body must contain valid JSON.");
  }
}
