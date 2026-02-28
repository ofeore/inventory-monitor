type Product = {
  id: string;
  name: string;
  stock: number;
};

type Thresholds = Record<string, number>;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (
    !body ||
    !Array.isArray(body.products) ||
    typeof body.thresholds !== "object"
  ) {
    return new Response("Invalid request body", { status: 400 });
  }

  const products: Product[] = body.products;
  const thresholds: Thresholds = body.thresholds;

  const alerts = products
    .map((product) => {
      const threshold = thresholds[product.id] ?? 0;

      if (product.stock < threshold) {
        return {
          productId: product.id,
          name: product.name,
          stock: product.stock,
          threshold: threshold,
        };
      }

      return null;
    })
    .filter(Boolean);

  return Response.json({ alerts });
}
