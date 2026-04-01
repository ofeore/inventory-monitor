"use client";

import {
  Line,
  Legend,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useState } from "react";

const data = [
  { day: "Day 1", sales: 1 },
  { day: "Day 2", sales: 2 },
  { day: "Day 3", sales: 3 },
];

export default function Analytics() {
  return (
    <main className="app-container">
      <button></button>
      <h2>Analytics</h2>
      <div className="charts-container">
        <div className="chart-card">
          <h3 className="chart-title">Days until stockout</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data}
              responsive
              margin={{
                top: 20,
                right: 20,
                bottom: 5,
                left: 0,
              }}
            >
              <CartesianGrid />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="purple"
                strokeWidth={2}
                name="Daily sales"
              />
              <XAxis dataKey={"day"} />
              <YAxis
                dataKey={"sales"}
                width="auto"
                allowDecimals={false}
                domain={[0, "dataMax"]}
                label={{
                  value: "Number of Sales",
                  position: "insideLeft",
                  angle: -90,
                  textAnchor: "middle",
                }}
              />
              <Legend align="right" />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bottom-charts">
          <div className="chart-card">
            <h3 className="chart-title">Top seller</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={data}
                margin={{ top: 20, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="purple"
                  strokeWidth={2}
                  name="Daily sales"
                />
                <XAxis dataKey="day" />
                <YAxis
                  dataKey="sales"
                  width="auto"
                  allowDecimals={false}
                  domain={[0, "dataMax"]}
                  label={{
                    value: "Number of Sales",
                    position: "insideLeft",
                    angle: -90,
                    textAnchor: "middle",
                  }}
                />
                <Legend align="right" />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3 className="chart-title">Most at risk product</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={data}
                margin={{ top: 20, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="purple"
                  strokeWidth={2}
                  name="Daily sales"
                />
                <XAxis dataKey="day" />
                <YAxis
                  dataKey="sales"
                  width="auto"
                  allowDecimals={false}
                  domain={[0, "dataMax"]}
                  label={{
                    value: "Number of Sales",
                    position: "insideLeft",
                    angle: -90,
                    textAnchor: "middle",
                  }}
                />
                <Legend align="right" />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </main>
  );
}
