import type { Product } from "@/types";

type ChartFilterDropdownProps = {
  products: Product[];
  selectedProductId: string;
  setSelectedProductId: (value: string) => void;
};

export default function ChartFilterDropdown({
  products,
  selectedProductId,
  setSelectedProductId,
}: ChartFilterDropdownProps) {
  return (
    <select
      className="input"
      value={selectedProductId}
      onChange={(e) => setSelectedProductId(e.target.value)}
    >
      {products.map((product) => (
        <option key={product.id} value={product.id}>
          {product.name}
        </option>
      ))}
    </select>
  );
}
