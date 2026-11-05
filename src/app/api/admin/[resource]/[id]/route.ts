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

async function getTarget(context: RouteContext) {
  const { resource, id } = await context.params;
  return { resource: parseResource(resource), id };
}

export async function GET(request: NextRequest, context: RouteContext) {
  const target = await getTarget(context);
  if (!target.resource) {
    return Response.json({ error: "Collection not found." }, { status: 404 });
  }
  return getAdminContent(request, target.resource, target.id);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const target = await getTarget(context);
  if (!target.resource) {
    return Response.json({ error: "Collection not found." }, { status: 404 });
  }
  return updateAdminContent(request, target.resource, target.id);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const target = await getTarget(context);
  if (!target.resource) {
    return Response.json({ error: "Collection not found." }, { status: 404 });
  }
  return deleteAdminContent(request, target.resource, target.id);
}
