"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowLeft, AlertTriangle, Package, PoundSterling } from "lucide-react";
import { MOCK_PRODUCTS, THRESHOLDS_STORAGE_KEY } from "@/mock-data";
import type { AnalyticsFilterValue, ChartDataPoint, Product } from "@/types";

type InventoryState = "healthy" | "warning" | "critical";

function getAverageDailySales(product: Product) {
  const total = product.sales.reduce((sum, item) => sum + item.unitsSold, 0);
  return total / product.sales.length;
}

function getProjectedDailySales(product: Product, days = 7) {
  const averageDailySales = getAverageDailySales(product);

  return Array.from({ length: days }, (_, index) => {
    const variationPattern = [0.92, 1, 0.97, 1.05, 0.95, 1.08, 0.98];
    const multiplier = variationPattern[index % variationPattern.length];

    return Math.max(0, Math.round(averageDailySales * multiplier));
  });
}

function getProjectedStocks(product: Product, days = 7) {
  const projectedSales = getProjectedDailySales(product, days);
  const projectedStocks: number[] = [];

  let runningStock = product.currentStock;

  projectedSales.forEach((unitsSold) => {
    runningStock = Math.max(0, runningStock - unitsSold);
    projectedStocks.push(runningStock);
  });

  return projectedStocks;
}

function getInventoryState(product: Product): InventoryState {
  const projectedStocks = getProjectedStocks(product);
  const firstThresholdBreachDay = projectedStocks.findIndex(
    (stock) => stock <= product.threshold,
  );

  if (product.currentStock <= product.threshold) {
    return "critical";
  }

  if (firstThresholdBreachDay !== -1) {
    return "warning";
  }

  return "healthy";
}

function getTopSeller(products: Product[]) {
  return [...products].sort(
    (a, b) => getAverageDailySales(b) - getAverageDailySales(a),
  )[0];
}

function getSelectedProduct(
  products: Product[],
  filterValue: AnalyticsFilterValue,
) {
  if (filterValue === "top-seller") {
    return getTopSeller(products);
  }

  return products.find((product) => product.id === filterValue) ?? products[0];
}

function getDaysUntilThreshold(product: Product) {
  if (product.currentStock <= product.threshold) {
    return 0;
  }

  const projectedStocks = getProjectedStocks(product);
  const firstThresholdBreachDay = projectedStocks.findIndex(
    (stock) => stock <= product.threshold,
  );

  if (firstThresholdBreachDay === -1) {
    return Infinity;
  }

  return firstThresholdBreachDay + 1;
}

function getDaysUntilStockout(product: Product) {
  const projectedStocks = getProjectedStocks(product);
  const firstStockoutDay = projectedStocks.findIndex((stock) => stock <= 0);

  if (firstStockoutDay === -1) {
    return 7 - firstStockoutDay;
  }

  return firstStockoutDay + 1;
}

function getExpectedRevenueLoss(product: Product) {
  const averageDailySales = getAverageDailySales(product);
  const estimatedDaysOutOfStock = 7;

  return Math.round(
    averageDailySales * product.unitPrice * estimatedDaysOutOfStock,
  );
}

function getRecommendedReorderQuantity(product: Product) {
  const averageDailySales = getAverageDailySales(product);
  const targetDaysCover = 14;

  const suggested = Math.ceil(
    averageDailySales * targetDaysCover +
      product.threshold -
      product.currentStock,
  );

  return Math.max(suggested, 0);
}

function getReorderMessage(product: Product) {
  const daysUntilThreshold = getDaysUntilThreshold(product);

  if (daysUntilThreshold === Infinity) {
    return "Stock level healthy";
  }

  if (daysUntilThreshold <= 0) {
    return "Reorder now";
  }

  if (daysUntilThreshold === 1) {
    return "Reorder within 1 day";
  }

  return `Reorder within ${daysUntilThreshold} days`;
}

function buildChartData(product: Product): ChartDataPoint[] {
  const totalHistoricalSales = product.sales.reduce(
    (sum, item) => sum + item.unitsSold,
    0,
  );

  let runningHistoricalStock = product.currentStock + totalHistoricalSales;

  const history: ChartDataPoint[] = product.sales.map((item) => {
    runningHistoricalStock = Math.max(
      0,
      runningHistoricalStock - item.unitsSold,
    );

    return {
      date: item.date,
      actualStock: runningHistoricalStock,
      projectedStock: null,
    };
  });

  const projectedSales = getProjectedDailySales(product, 7);
  let runningProjectedStock = product.currentStock;

  const projection: ChartDataPoint[] = projectedSales.map(
    (unitsSold, index) => {
      runningProjectedStock = Math.max(0, runningProjectedStock - unitsSold);

      return {
        date: `Apr ${index + 1}`,
        actualStock: null,
        projectedStock: runningProjectedStock,
      };
    },
  );

  const lastHistoricalPoint = history[history.length - 1];

  const bridgePoint: ChartDataPoint = {
    date: lastHistoricalPoint.date,
    actualStock: lastHistoricalPoint.actualStock,
    projectedStock: product.currentStock,
  };

  return [...history.slice(0, -1), bridgePoint, ...projection];
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [thresholdOverrides, setThresholdOverrides] = useState<
    Record<string, number>
  >({});

  const products = useMemo(
    () =>
      MOCK_PRODUCTS.map((product) => ({
        ...product,
        threshold: thresholdOverrides[product.id] ?? product.threshold,
      })),
    [thresholdOverrides],
  );

  const [selectedFilter, setSelectedFilter] = useState<AnalyticsFilterValue>(
    MOCK_PRODUCTS[0].id,
  );

  useEffect(() => {
    const savedThresholds = window.localStorage.getItem(THRESHOLDS_STORAGE_KEY);

    if (!savedThresholds) return;

    try {
      const parsedThresholds = JSON.parse(savedThresholds) as Record<
        string,
        number
      >;
      setThresholdOverrides(parsedThresholds);
    } catch {
      console.error("Failed to parse saved thresholds");
    }
  }, []);

  const selectedProduct = useMemo(
    () => getSelectedProduct(products, selectedFilter),
    [products, selectedFilter],
  );

  const chartData = useMemo(
    () => buildChartData(selectedProduct),
    [selectedProduct],
  );

  const averageDailySales = getAverageDailySales(selectedProduct);
  const daysUntilThreshold = getDaysUntilThreshold(selectedProduct);
  const daysUntilStockout = getDaysUntilStockout(selectedProduct);
  const reorderMessage = getReorderMessage(selectedProduct);
  const expectedRevenueLoss = getExpectedRevenueLoss(selectedProduct);
  const recommendedReorderQuantity =
    getRecommendedReorderQuantity(selectedProduct);

  const inventoryState = getInventoryState(selectedProduct);

  const statusText =
    inventoryState === "critical"
      ? "Critical"
      : inventoryState === "warning"
        ? "At risk"
        : "Healthy";

  const statusClassName =
    inventoryState === "critical"
      ? "analytics-status analytics-status-critical"
      : inventoryState === "warning"
        ? "analytics-status analytics-status-warning"
        : "analytics-status analytics-status-healthy";

  const maxChartValue = Math.max(
    ...chartData.map((item) =>
      Math.max(item.actualStock ?? 0, item.projectedStock ?? 0),
    ),
    selectedProduct.threshold,
  );

  return (
    <>
      <div className="header-row">
        <button
          type="button"
          className="back-button"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ArrowLeft className="icon" />
        </button>

        <div>
          <h2 className="analytics-heading">Analytics</h2>
          <p className="analytics-subtitle">
            Inventory forecast and reorder guidance
          </p>
        </div>
      </div>

      <main className="app-container">
        <div className="charts-container">
          <div className="chart-card">
            <div className="chart-card-top analytics-chart-top">
              <div>
                <h3 className="chart-title">{reorderMessage}</h3>
                <p className="chart-subtitle">{selectedProduct.name}</p>
              </div>

              <div className="analytics-chart-controls">
                <select
                  className="analytics-select"
                  value={selectedFilter}
                  onChange={(e) =>
                    setSelectedFilter(e.target.value as AnalyticsFilterValue)
                  }
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                  <option value="top-seller">Top Seller</option>
                </select>

                <span className={statusClassName}>{statusText}</span>
              </div>
            </div>

            <div className="analytics-mini-metrics">
              <div className="analytics-mini-metric">
                <span className="analytics-mini-label">Current stock</span>
                <strong>{selectedProduct.currentStock}</strong>
              </div>
              <div className="analytics-mini-metric">
                <span className="analytics-mini-label">Threshold floor</span>
                <strong>{selectedProduct.threshold}</strong>
              </div>
              <div className="analytics-mini-metric">
                <span className="analytics-mini-label">Avg daily sales</span>
                <strong>{averageDailySales.toFixed(1)}</strong>
              </div>
              <div className="analytics-mini-metric">
                <span className="analytics-mini-label">Days to stockout</span>
                <strong>
                  {daysUntilStockout === Infinity ? "—" : daysUntilStockout}
                </strong>
              </div>
            </div>

            <div className="main-chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 20,
                    bottom: 5,
                    left: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis
                    allowDecimals={false}
                    domain={[0, maxChartValue + 4]}
                  />
                  <Tooltip />
                  <ReferenceArea
                    y1={0}
                    y2={selectedProduct.threshold}
                    fill="#ef4444"
                    fillOpacity={0.12}
                  />
                  <ReferenceLine
                    y={selectedProduct.threshold}
                    stroke="#ef4444"
                    strokeDasharray="6 6"
                    label={{
                      value: `Threshold (${selectedProduct.threshold})`,
                      position: "insideTopRight",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="actualStock"
                    stroke="var(--primary)"
                    strokeWidth={3}
                    name="Historical stock"
                    dot={false}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="projectedStock"
                    stroke="#22c55e"
                    strokeWidth={3}
                    strokeDasharray="6 6"
                    name="Projected stock"
                    dot={false}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="analytics-stats-grid">
            <div className="analytics-stat-card">
              <div className="analytics-stat-top">
                <AlertTriangle size={18} className="analytics-stat-icon" />
                <span className="analytics-stat-label">Reorder action</span>
              </div>
              <h3 className="analytics-stat-value">{reorderMessage}</h3>
              <p className="analytics-stat-text">
                Lead time is {selectedProduct.reorderLeadDays} days for this
                item.
              </p>
            </div>

            <div className="analytics-stat-card">
              <div className="analytics-stat-top">
                <PoundSterling size={18} className="analytics-stat-icon" />
                <span className="analytics-stat-label">
                  Expected revenue loss
                </span>
              </div>
              <h3 className="analytics-stat-value">£{expectedRevenueLoss}</h3>
              <p className="analytics-stat-text">
                Estimated 7-day impact if the item goes out of stock.
              </p>
            </div>

            <div className="analytics-stat-card">
              <div className="analytics-stat-top">
                <Package size={18} className="analytics-stat-icon" />
                <span className="analytics-stat-label">
                  Recommended reorder
                </span>
              </div>
              <h3 className="analytics-stat-value">
                {recommendedReorderQuantity === 0
                  ? "No reorder needed"
                  : `${recommendedReorderQuantity} units`}
              </h3>
              <p className="analytics-stat-text">
                Suggested quantity based on the next 14 days of demand.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
