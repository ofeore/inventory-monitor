export type SalesDataPoint = {
  date: string;
  unitsSold: number;
};

export type Product = {
  id: string;
  name: string;
  currentStock: number;
  threshold: number;
  unitPrice: number;
  reorderLeadDays: number;
  sales: SalesDataPoint[];
};

export type Alert = {
  productId: string;
  name: string;
  currentStock: number;
  threshold: number;
};

export type ChartDataPoint = {
  date: string;
  actualSales: number | null;
  projectedSales: number | null;
};

export type AnalyticsFilterValue = string | "top-seller" | "most-at-risk";
