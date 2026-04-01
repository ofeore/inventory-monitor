import type { Alert } from "@/types";

type AlertsListProps = {
  alerts: Alert[];
};

export function AlertsList({ alerts }: AlertsListProps) {
  if (alerts.length === 0) {
    return (
      <p className="home-empty-state">
        No alerts yet. Click “Run Inventory Check”.
      </p>
    );
  }

  return (
    <ul className="alertsList">
      {alerts.map((alert) => (
        <li key={alert.productId} className="alertItem">
          <div>
            <strong>{alert.name}</strong>
            <p>
              Current stock: {alert.currentStock} · Threshold: {alert.threshold}
            </p>
          </div>
          <span className="alertBadge">Action needed</span>
        </li>
      ))}
    </ul>
  );
}
