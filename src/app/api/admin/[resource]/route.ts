import type { NextRequest } from "next/server";
import {
  createAdminContent,
  listAdminContent,
} from "@/lib/admin-api";
import { parseResource } from "@/lib/content-validation";

type RouteContext = {
  params: Promise<{ resource: string }>;
};

async function getResource(context: RouteContext) {
  const { resource } = await context.params;
  return parseResource(resource);
}

export async function GET(request: NextRequest, context: RouteContext) {
  const resource = await getResource(context);
  if (!resource) {
    return Response.json({ error: "Collection not found." }, { status: 404 });
  }
  return listAdminContent(request, resource);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const resource = await getResource(context);
  if (!resource) {
    return Response.json({ error: "Collection not found." }, { status: 404 });
  }
  return createAdminContent(request, resource);
}
