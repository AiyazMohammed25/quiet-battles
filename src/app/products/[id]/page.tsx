import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import ProductPurchasePanel from "@/components/ProductPurchasePanel";
import { getPublishedProductBySlug } from "@/lib/public-content";

// Find the published product from the URL slug and show its purchase panel.
async function ProductContent({ params }: { params: Promise<{ id: string }> }) {
  // Resolve the dynamic product ID on the server before passing catalog data to the client UI.
  const { id } = await params;
  await connection();
  const product = await getPublishedProductBySlug(id);

  if (!product) notFound();

  return <ProductPurchasePanel product={product} />;
}

// Show the product page with a loading message while the product is fetched.
export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <p className="px-6 py-24 text-center text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          Opening the product…
        </p>
      }
    >
      <ProductContent params={params} />
    </Suspense>
  );
}
