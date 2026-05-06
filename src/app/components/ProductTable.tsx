import type { Product } from "@/types";

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
    <table className="dataTable">
      <thead>
        <tr>
          <th className="tableHeaderCell">Product</th>
          <th className="tableHeaderCell">Current Stock</th>
          <th className="tableHeaderCell">Threshold</th>
          <th className="tableHeaderCell">Status</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => {
          const threshold = thresholds[product.id] ?? product.threshold;
          const isLow = product.currentStock < threshold;

          return (
            <tr key={product.id}>
              <td className="tableBodyCell">{product.name}</td>
              <td className="tableBodyCell">{product.currentStock}</td>
              <td className="tableBodyCell">
                <input
                  className="numberInput"
                  type="number"
                  min="0"
                  value={threshold}
                  onChange={(e) =>
                    onThresholdChange(product.id, e.target.value)
                  }
                />
              </td>
              <td className="tableBodyCell">
                {isLow ? (
                  <span className="statusLow">Critical</span>
                ) : (
                  <span className="statusOk">Healthy</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
