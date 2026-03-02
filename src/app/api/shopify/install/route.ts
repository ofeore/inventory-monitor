import { NextResponse } from "next/server";

function cleanShopInput(raw: string) {
  return raw
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");
}

function isValidShop(shop: string) {
  return /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(shop);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const shop = cleanShopInput(url.searchParams.get("shop") || "");

  if (!shop || !isValidShop(shop)) {
    return new Response(
      "Invalid shop. Example: inventory-monitor-dev.myshopify.com",
      {
        status: 400,
      },
    );
  }

  const apiKey = process.env.SHOPIFY_API_KEY;
  const appUrl = process.env.APP_URL;
  if (!apiKey || !appUrl) {
    return new Response("Missing SHOPIFY_API_KEY or APP_URL env vars.", {
      status: 500,
    });
  }

  const scope = "read_inventory,read_products";
  const redirectUri = `${appUrl}/api/shopify/callback`;

  const authorizeUrl = new URL(`https://${shop}/admin/oauth/authorize`);
  authorizeUrl.searchParams.set("client_id", apiKey);
  authorizeUrl.searchParams.set("scope", scope);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);

  return NextResponse.redirect(authorizeUrl.toString());
}
