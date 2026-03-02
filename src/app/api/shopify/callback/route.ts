import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const shop = url.searchParams.get("shop") || "";
  const code = url.searchParams.get("code") || "";

  if (!shop || !code) {
    return new Response("Missing shop or code in callback.", { status: 400 });
  }

  const apiKey = process.env.SHOPIFY_API_KEY;
  const apiSecret = process.env.SHOPIFY_API_SECRET;
  const appUrl = process.env.APP_URL;

  if (!apiKey || !apiSecret || !appUrl) {
    return new Response("Missing Shopify env vars.", { status: 500 });
  }

  const tokenResponse = await fetch(
    `https://${shop}/admin/oauth/access_token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: apiKey,
        client_secret: apiSecret,
        code,
      }),
    },
  );

  if (!tokenResponse.ok) {
    const text = await tokenResponse.text();
    return new Response(`Token exchange failed: ${text}`, { status: 500 });
  }

  const { access_token } = (await tokenResponse.json()) as {
    access_token: string;
  };

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return new Response("Missing Supabase env vars.", { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const { error } = await supabase
    .from("store_connections")
    .upsert({ shop, access_token }, { onConflict: "shop" });

  if (error) {
    return new Response(`Supabase error: ${error.message}`, { status: 500 });
  }

  return NextResponse.redirect(
    `${appUrl}/?connected=1&shop=${encodeURIComponent(shop)}`,
  );
}
