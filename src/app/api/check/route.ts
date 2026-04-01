import type { Product, Alert } from "@/types";

type Thresholds = Record<string, number>;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (
    !body ||
    !Array.isArray(body.products) ||
    typeof body.thresholds !== "object" ||
    body.thresholds === null
  ) {
    return new Response("Invalid request body", { status: 400 });
  }

  const products: Product[] = body.products;
  const thresholds: Thresholds = body.thresholds;

  const alerts: Alert[] = products
    .map((product) => {
      const threshold = thresholds[product.id] ?? product.threshold;

      if (product.currentStock < threshold) {
        return {
          productId: product.id,
          name: product.name,
          currentStock: product.currentStock,
          threshold,
        };
      }

      return null;
    })
    .filter((alert): alert is Alert => alert !== null);

  return Response.json({ alerts });
}
