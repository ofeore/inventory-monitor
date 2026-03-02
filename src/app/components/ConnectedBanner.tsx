"use client";

import { useSearchParams } from "next/navigation";

export function ConnectedBanner() {
  const searchParams = useSearchParams();
  const connected = searchParams.get("connected");
  const shop = searchParams.get("shop");

  if (connected !== "1" || !shop) return null;

  return (
    <div className="connectionBanner">
      ✅ Connected to <strong>{shop}</strong>
    </div>
  );
}
