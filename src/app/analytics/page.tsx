"use client";

import { useMemo, useState } from "react";
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
import { MOCK_PRODUCTS } from "@/mock-data";
import type { AnalyticsFilterValue, ChartDataPoint, Product } from "@/types";

function getAverageDailySales(product: Product) {
  const total = product.sales.reduce((sum, item) => sum + item.unitsSold, 0);
  return total / product.sales.length;
}

function getTopSeller(products: Product[]) {
  return [...products].sort(
    (a, b) => getAverageDailySales(b) - getAverageDailySales(a),
  )[0];
}

function getMostAtRisk(products: Product[]) {
  return [...products].sort(
    (a, b) => getDaysUntilThreshold(a) - getDaysUntilThreshold(b),
  )[0];
}

function getSelectedProduct(
  products: Product[],
  filterValue: AnalyticsFilterValue,
) {
  if (filterValue === "top-seller") {
    return getTopSeller(products);
  }

  if (filterValue === "most-at-risk") {
    return getMostAtRisk(products);
  }

  return products.find((product) => product.id === filterValue) ?? products[0];
}

function getDaysUntilThreshold(product: Product) {
  const averageDailySales = getAverageDailySales(product);

  if (averageDailySales <= 0) {
    return Infinity;
  }

  const stockBeforeThreshold = product.currentStock - product.threshold;

  if (stockBeforeThreshold <= 0) {
    return 0;
  }

  return Math.floor(stockBeforeThreshold / averageDailySales);
}

function getDaysUntilStockout(product: Product) {
  const averageDailySales = getAverageDailySales(product);

  if (averageDailySales <= 0) {
    return Infinity;
  }

  return Math.floor(product.currentStock / averageDailySales);
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
  const averageDailySales = Number(getAverageDailySales(product).toFixed(1));

  const history: ChartDataPoint[] = product.sales.map((item) => ({
    date: item.date,
    actualSales: item.unitsSold,
    projectedSales: null,
  }));

  const lastHistoryPoint = history[history.length - 1];

  const bridgePoint: ChartDataPoint = {
    date: lastHistoryPoint.date,
    actualSales: lastHistoryPoint.actualSales,
    projectedSales: lastHistoryPoint.actualSales,
  };

  const projection: ChartDataPoint[] = Array.from(
    { length: 7 },
    (_, index) => ({
      date: `Apr ${index + 1}`,
      actualSales: null,
      projectedSales: averageDailySales,
    }),
  );

  return [...history.slice(0, -1), bridgePoint, ...projection];
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<AnalyticsFilterValue>(
    MOCK_PRODUCTS[0].id,
  );

  const selectedProduct = useMemo(
    () => getSelectedProduct(MOCK_PRODUCTS, selectedFilter),
    [selectedFilter],
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

  const isCritical = selectedProduct.currentStock <= selectedProduct.threshold;
  const isWarning =
    !isCritical && daysUntilThreshold <= selectedProduct.reorderLeadDays;

  const statusText = isCritical
    ? "Critical"
    : isWarning
      ? "At risk"
      : "Healthy";
  const statusClassName = isCritical
    ? "analytics-status analytics-status-critical"
    : isWarning
      ? "analytics-status analytics-status-warning"
      : "analytics-status analytics-status-healthy";

  const maxChartValue = Math.max(
    ...selectedProduct.sales.map((item) => item.unitsSold),
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
                  {MOCK_PRODUCTS.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                  <option value="top-seller">Top Seller</option>
                  <option value="most-at-risk">Most At-Risk Product</option>
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
                  />
                  <Line
                    type="monotone"
                    dataKey="actualSales"
                    stroke="var(--primary)"
                    strokeWidth={3}
                    name="Actual sales"
                    dot={false}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="projectedSales"
                    stroke="#22c55e"
                    strokeWidth={3}
                    strokeDasharray="6 6"
                    name="Projected sales"
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
