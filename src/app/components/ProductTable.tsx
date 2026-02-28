type Product = {
  id: string;
  name: string;
  stock: number;
};

type ProductTableProps = {
  products: Product[];
  thresholds: Record<string, number>;
  onThresholdChange: (productId: string, value: string) => void;
};

export function ProductTable({
  products,
  thresholds,
  onThresholdChange,
}: ProductTableProps) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th className="th">Product</th>
          <th className="th">Stock</th>
          <th className="th">Threshold</th>
          <th className="th">Status</th>
        </tr>
      </thead>
      <tbody>
        {products.map((p) => {
          const threshold = thresholds[p.id] ?? 0;
          const isLow = p.stock < threshold;

          return (
            <tr key={p.id}>
              <td className="td">{p.name}</td>
              <td className="td">{p.stock}</td>
              <td className="td">
                <input
                  className="input"
                  value={threshold}
                  onChange={(e) => onThresholdChange(p.id, e.target.value)}
                />
              </td>
              <td className="td">
                {isLow ? (
                  <span className="badgeLow">⚠️ Low</span>
                ) : (
                  <span className="badgeOk">✅ OK</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
