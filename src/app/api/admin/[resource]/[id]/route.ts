import type { NextRequest } from "next/server";
import {
  deleteAdminContent,
  getAdminContent,
  updateAdminContent,
} from "@/lib/admin-api";
import { parseResource } from "@/lib/content-validation";

type RouteContext = {
  params: Promise<{ resource: string; id: string }>;
};

// Read the URL values and check that the collection name is supported.
async function getTarget(context: RouteContext) {
  const { resource, id } = await context.params;
  return { resource: parseResource(resource), id };
}

// Return one admin record by its ID.
export async function GET(request: NextRequest, context: RouteContext) {
  const target = await getTarget(context);
  if (!target.resource) {
    return Response.json({ error: "Collection not found." }, { status: 404 });
  }
  return getAdminContent(request, target.resource, target.id);
}

// Update one admin record after the server checks the request.
export async function PATCH(request: NextRequest, context: RouteContext) {
  const target = await getTarget(context);
  if (!target.resource) {
    return Response.json({ error: "Collection not found." }, { status: 404 });
  }
  return updateAdminContent(request, target.resource, target.id);
}

// Delete one admin record and keep its database references consistent.
export async function DELETE(request: NextRequest, context: RouteContext) {
  const target = await getTarget(context);
  if (!target.resource) {
    return Response.json({ error: "Collection not found." }, { status: 404 });
  }
  return deleteAdminContent(request, target.resource, target.id);
}
