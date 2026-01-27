import { formatCurrency } from "@/lib/format/currency";
import { FC } from "react";

interface ChallanViewTableProps {
  items: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    materialId: string | null;
    challanId: string;
    materialName: string | null;
    unit: string | null;
    quantity: number;
    rate: number | null;
    amount: number | null;
    discount: number | null;
    material: {
      name: string;
      id: string;
      createdAt: Date;
      updatedAt: Date;
      businessId: string;
      unit: string;
      isActive: boolean;
      hsnCode: string | null;
      gstRate: number | null;
    } | null;
  }[];
  index: number;
}

const ChallanViewTable: FC<ChallanViewTableProps> = ({ items, index }) => {
  console.log(items);

  return (
    <div className=" flex flex-col ">
      <div className="grid grid-cols-9 p-4 border-black border-t-0  border">
        <th className="py-2 text-left text-sm">#</th>
        <th className="py-2 text-left text-sm col-span-3">Material</th>
        <th className="py-2 text-left text-sm">Unit</th>
        <th className="py-2 text-right text-sm">Qty</th>
        <th className="py-2 text-right text-sm">Rate</th>
        <th className="py-2 text-right text-sm col-span-2">Amount</th>
      </div>

      <div className="">
        {items.map((item) => {
          return (
            <tr key={item.id} className="border-b grid grid-cols-9 px-4">
              <td className="py-2 text-sm">{index}</td>

              <td className="py-2 text-sm col-span-3">
                {item.material?.name ?? item.materialName ?? "-"}
              </td>

              <td className="py-2 text-sm">
                {item.material?.unit ?? item.unit ?? "-"}
              </td>

              <td className="py-2 text-sm text-right">
                {item.quantity.toFixed(2)}
              </td>
              <td className="py-2 text-sm text-right">
                {formatCurrency(item.rate) ?? "-"}
              </td>

              <td className="py-2 text-sm text-right col-span-2">
                {formatCurrency(item.amount ?? 0)}
              </td>
            </tr>
          );
        })}
      </div>
    </div>
  );
};

export default ChallanViewTable;
