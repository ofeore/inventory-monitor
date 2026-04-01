"use client";

import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  ArrowLeft,
  AlertTriangle,
  TrendingUp,
  Package,
  Link,
} from "lucide-react";
import { useRouter } from "next/navigation";

const data = [
  { day: "Mon", sales: 18 },
  { day: "Tue", sales: 22 },
  { day: "Wed", sales: 19 },
  { day: "Thu", sales: 24 },
  { day: "Fri", sales: 27 },
  { day: "Sat", sales: 21 },
  { day: "Sun", sales: 16 },
];

export default function Analytics() {
  const router = useRouter(); // Next.js Link does not work with lucide icons for some reason, displays massive default link emoji unremovable.
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
            Inventory risk and sales overview
          </p>
        </div>
      </div>

      <main className="app-container">
        <div className="charts-container">
          <div className="chart-card">
            <div className="chart-card-top">
              <div>
                <h3 className="chart-title">Reorder within 5 days</h3>
                <p className="chart-subtitle">
                  Current sales trend for selected product
                </p>
              </div>
              <span className="chart-badge">At risk</span>
            </div>

            <div className="main-chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{
                    top: 20,
                    right: 20,
                    bottom: 5,
                    left: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" />
                  <YAxis allowDecimals={false} domain={[0, "dataMax + 5"]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="var(--primary)"
                    strokeWidth={3}
                    name="Daily sales"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="analytics-stats-grid">
            <div className="analytics-stat-card">
              <div className="analytics-stat-top">
                <AlertTriangle size={18} className="analytics-stat-icon" />
                <span className="analytics-stat-label">Reorder within</span>
              </div>
              <h3 className="analytics-stat-value">5 days</h3>
              <p className="analytics-stat-text">
                Stock is running low based on current demand.
              </p>
            </div>

            <div className="analytics-stat-card">
              <div className="analytics-stat-top">
                <TrendingUp size={18} className="analytics-stat-icon" />
                <span className="analytics-stat-label">
                  Estimated revenue loss
                </span>
              </div>
              <h3 className="analytics-stat-value">£420</h3>
              <p className="analytics-stat-text">
                Potential loss if this item goes out of stock.
              </p>
            </div>

            <div className="analytics-stat-card">
              <div className="analytics-stat-top">
                <Package size={18} className="analytics-stat-icon" />
                <span className="analytics-stat-label">
                  Recommended reorder
                </span>
              </div>
              <h3 className="analytics-stat-value">50 units</h3>
              <p className="analytics-stat-text">
                Suggested quantity to reduce stockout risk.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
