type Alert = {
  productId: string;
  name: string;
  stock: number;
  threshold: number;
};

type AlertsListProps = {
  alerts: Alert[];
};

export function AlertsList({ alerts }: AlertsListProps) {
  if (alerts.length === 0) {
    return <p>No alerts yet. Click “Run Inventory Check”.</p>;
  }

  return (
    <ul>
      {alerts.map((a) => (
        <li key={a.productId}>
          ⚠️ {a.name} — stock {a.stock} (threshold {a.threshold})
        </li>
      ))}
    </ul>
  );
}
