"use client";

import { useState, useEffect } from "react";
import { ProductTable } from "./components/ProductTable";
import { AlertsList } from "./components/AlertsList";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  stock: number;
};

type Alert = {
  productId: string;
  name: string;
  stock: number;
  threshold: number;
};

const MOCK_PRODUCTS: Product[] = [
  { id: "p1", name: "Blue Hoodie - M", stock: 3 },
  { id: "p2", name: "Blue Hoodie - L", stock: 10 },
  { id: "p3", name: "Red T-Shirt - S", stock: 1 },
];

export default function Home() {
  const searchParams = useSearchParams();
  const connected = searchParams.get("connected");
  const shop = searchParams.get("shop");

  const [thresholds, setThresholds] = useState<Record<string, number>>({
    p1: 5,
    p2: 5,
    p3: 2,
  });

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function handleThresholdChange(productId: string, value: string) {
    const numberValue = Number(value);
    if (Number.isNaN(numberValue)) return;

    setThresholds((prev) => ({
      ...prev,
      [productId]: numberValue,
    }));
  }

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function runCheck() {
    setLoading(true);
    setError("");
    setAlerts([]);

    try {
      await sleep(3000);
      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: MOCK_PRODUCTS,
          thresholds: thresholds,
        }),
      });

      if (!response.ok) throw new Error("Backend check failed");

      const data: { alerts: Alert[] } = await response.json();
      setAlerts(data.alerts);
    } catch {
      setError("Something went wrong calling the backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="appContainer">
      <button
        className="themeToggleButton"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        {theme === "light" ? "🌙 Dark" : "☀️ Light"}
      </button>

      <div className="headerRow">
        {connected === "1" && shop && (
          <div className="connectionBanner">
            ✅ Connected to <strong>{shop}</strong>
          </div>
        )}
        <h1 className="pageTitle">Inventory Monitor (MVP)</h1>

        <Link className="primaryButton" href="/connect">
          Connect Store
        </Link>
      </div>

      <p className="pageSubtitle">
        Mock products + thresholds. Button calls the backend API.
      </p>

      <section className="card">
        <h2 className="cardTitle">Products</h2>

        <ProductTable
          products={MOCK_PRODUCTS}
          thresholds={thresholds}
          onThresholdChange={handleThresholdChange}
        />

        {loading ? (
          <div className="loaderRow">
            <div className="loader" />
            <p className="loaderText">Analysing inventory...</p>
          </div>
        ) : (
          <button className="primaryButton" onClick={runCheck}>
            Run Inventory Check
          </button>
        )}

        {error && <p className="errorText">Error: {error}</p>}
      </section>

      <section className="card">
        <h2 className="cardTitle">Alerts (from backend)</h2>
        <AlertsList alerts={alerts} />
      </section>
    </main>
  );
}
