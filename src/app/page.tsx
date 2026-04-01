"use client";

import { useMemo, useState, useEffect } from "react";
import { ProductTable } from "./components/ProductTable";
import { AlertsList } from "./components/AlertsList";
import Link from "next/link";
import { MOCK_PRODUCTS, THRESHOLDS_STORAGE_KEY } from "@/mock-data";
import type { Alert } from "@/types";
import { Bell, Boxes, ChartColumn, Store, ShieldAlert } from "lucide-react";

export default function Home() {
  const [thresholds, setThresholds] = useState<Record<string, number>>({
    p1: 5,
    p2: 5,
    p3: 2,
  });

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [connectedShop, setConnectedShop] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    const shop = params.get("shop");

    if (connected === "1" && shop) {
      setConnectedShop(shop);
    }
  }, []);

  useEffect(() => {
    const savedThresholds = window.localStorage.getItem(THRESHOLDS_STORAGE_KEY);

    if (!savedThresholds) return;

    try {
      const parsedThresholds = JSON.parse(savedThresholds) as Record<
        string,
        number
      >;

      setThresholds((prev) => ({
        ...prev,
        ...parsedThresholds,
      }));
    } catch {
      console.error("Failed to parse saved thresholds");
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function handleThresholdChange(productId: string, value: string) {
    const numberValue = Number(value);
    if (Number.isNaN(numberValue)) return;

    setThresholds((prev) => {
      const updatedThresholds = {
        ...prev,
        [productId]: numberValue,
      };

      window.localStorage.setItem(
        THRESHOLDS_STORAGE_KEY,
        JSON.stringify(updatedThresholds),
      );

      return updatedThresholds;
    });
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
          thresholds,
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

  const lowStockCount = useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => {
      const threshold = thresholds[product.id] ?? product.threshold;
      return product.currentStock < threshold;
    }).length;
  }, [thresholds]);

  const connectedStatus = connectedShop ? "Connected" : "Not connected";

  return (
    <main className="app-container">
      <div className="home-topbar">
        <button
          className="themeToggleButton"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </button>
      </div>

      <section className="home-hero card">
        <div className="home-hero-copy">
          <span className="home-header">Inventory Monitor</span>
          <h1 className="home-title">Inventory health dashboard</h1>
          <p className="home-description">
            Set product thresholds, run an inventory check, and see analytics to
            understand projected stock risk and reorder timing.
          </p>

          <div className="home-hero-actions">
            <Link className="primaryButton" href="/connect">
              <Store size={16} />
              Connect Store
            </Link>

            <Link className="secondaryButton" href="/analytics">
              <ChartColumn size={16} />
              View Analytics
            </Link>
          </div>
        </div>

        <div className="home-hero-status">
          <div className="home-status-card">
            <span className="home-status-label">Store status</span>
            <strong>{connectedStatus}</strong>
            <p>{connectedShop ? connectedShop : "No store connected yet"}</p>
          </div>

          <div className="home-status-card">
            <span className="home-status-label">Active alerts</span>
            <strong>{alerts.length}</strong>
            <p>
              {alerts.length === 0
                ? "No backend alerts after latest check"
                : "Products currently flagged by backend"}
            </p>
          </div>
        </div>
      </section>

      {connectedShop && (
        <div className="connectionBanner">
          Connected to: <strong>{connectedShop}</strong>
        </div>
      )}

      <section className="home-summary-grid">
        <div className="analytics-stat-card">
          <div className="analytics-stat-top">
            <Boxes size={18} className="analytics-stat-icon" />
            <span className="analytics-stat-label">Tracked products</span>
          </div>
          <h3 className="analytics-stat-value">{MOCK_PRODUCTS.length}</h3>
          <p className="analytics-stat-text">
            Products currently listed in your shop.
          </p>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-top">
            <ShieldAlert size={18} className="analytics-stat-icon" />
            <span className="analytics-stat-label">Below threshold</span>
          </div>
          <h3 className="analytics-stat-value">{lowStockCount}</h3>
          <p className="analytics-stat-text">
            Products currently below the threshold.
          </p>
        </div>
      </section>

      <section className="card home-section-card">
        <div className="home-section-header">
          <div>
            <h2 className="cardTitle">Products</h2>
            <p className="home-section-subtitle">
              Adjust the threshold floor for each product to control alerting
              and analytics behaviour.
            </p>
          </div>
        </div>

        <div className="home-table-shell">
          <ProductTable
            products={MOCK_PRODUCTS}
            thresholds={thresholds}
            onThresholdChange={handleThresholdChange}
          />
        </div>

        <div className="home-action-row">
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
        </div>
      </section>

      <section className="card home-section-card">
        <div className="home-section-header">
          <div>
            <h2 className="cardTitle">Alerts</h2>
            <p className="home-section-subtitle">
              Backend check results based on the latest thresholds and product
              stock levels.
            </p>
          </div>
        </div>

        <div className="home-alerts-shell">
          <AlertsList alerts={alerts} />
        </div>
      </section>
    </main>
  );
}
