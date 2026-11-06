import type { NextRequest } from "next/server";
import {
  createAdminContent,
  listAdminContent,
} from "@/lib/admin-api";
import { parseResource } from "@/lib/content-validation";

type RouteContext = {
  params: Promise<{ resource: string }>;
};

// Read the collection name from the URL and confirm it is supported.
async function getResource(context: RouteContext) {
  const { resource } = await context.params;
  return parseResource(resource);
}

// Return all records in the requested admin collection.
export async function GET(request: NextRequest, context: RouteContext) {
  const resource = await getResource(context);
  if (!resource) {
    return Response.json({ error: "Collection not found." }, { status: 404 });
  }
  return listAdminContent(request, resource);
}

// Create a record in the requested admin collection.
export async function POST(request: NextRequest, context: RouteContext) {
  const resource = await getResource(context);
  if (!resource) {
    return Response.json({ error: "Collection not found." }, { status: 404 });
  }
  return createAdminContent(request, resource);
}
