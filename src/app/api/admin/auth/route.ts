import { NextResponse, type NextRequest } from "next/server";
import {
  clearAdminSessionResponse,
  createAdminSessionResponse,
  isAdminAuthenticated,
  isAdminConfigured,
  requireSameOrigin,
} from "@/lib/auth";
import { InputError } from "@/lib/content-validation";
import { errorResponse, readJsonBody } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    authenticated: isAdminAuthenticated(request),
    configured: isAdminConfigured(),
  });
}

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  try {
    const body: unknown = await readJsonBody(request);
    if (
      typeof body !== "object" ||
      body === null ||
      !("password" in body) ||
      typeof body.password !== "string" ||
      body.password.length > 256
    ) {
      throw new InputError("Enter a valid admin password.");
    }
    return createAdminSessionResponse(body.password);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  return clearAdminSessionResponse();
}
