"use client";

import A4Page from "@/components/helpers/A4Page";
import { Prisma } from "@prisma/client/client";
import { FC, useState } from "react";
import ChallanHeader from "./challan-header";
import ChallanViewTable from "./challan-view-table";
import ChallanFooter from "./challan-footer";

interface ChallanViewProps {
  challan: Prisma.RegisterEntryGetPayload<{
    include: {
      party: true;
      business: true;
      items: { include: { material: true } };
    };
  }>;
}

const ChallanView: FC<ChallanViewProps> = ({ challan }) => {
  // paginate items across multiple A4 pages (same pattern as PO)
  const [perPage, setPerPage] = useState([challan.items.length]);
  const pages = perPage.map((amount, i) => {
    const offset = perPage.slice(0, i).reduce((t, n) => t + n, 0);
    return challan.items.slice(offset, offset + amount);
  });

  const challanHeader = {
    businessName: challan.business.name,
    businessAddress: challan.business.addressLine1,
    challanNo: challan.challanNo,
    challanDate: challan.date,
    businessCity: challan.business.city,
    businessGST: challan.business.gstin,
    businessEmail: challan.business.email,
    businessPhone: challan.business.phone,
    partyName: challan.party.name,
    partyAddress: challan.party.addressLine1,
    partyCity: challan.party.city,
    partyGST: challan.party.gstin,
    partyEmail: challan.party.email,
    partyPhone: challan.party.phone,
  };
  return (
    // <div className="print-root">
    //   {/* Header */}
    //   <div className="flex justify-between gap-6">
    //     <div>
    //       <h1 className="text-xl font-semibold">{challan.business.name}</h1>
    //       <div className="text-sm text-muted-foreground">
    //         {challan.business.addressLine1 ?? ""}
    //       </div>
    //     </div>

    //     <div className="text-right">
    //       <div className="text-sm">Challan</div>
    //       <div className="text-lg font-semibold">{challan.challanNo}</div>
    //       <div className="text-sm">
    //         Date: {new Date(challan.date).toLocaleDateString("en-IN")}
    //       </div>
    //     </div>
    //   </div>

    //   {/* Party */}
    //   <div className="mt-6 rounded border p-3">
    //     <div className="text-sm font-medium">Party</div>
    //     <div className="text-sm">{challan.party.name}</div>
    //   </div>

    //   {/* Items table */}
    //   <div className="mt-6">
    //     <table className="w-full border-collapse">
    //       <thead>
    //         <tr className="border-b">
    //           <th className="py-2 text-left text-sm">#</th>
    //           <th className="py-2 text-left text-sm">Material</th>
    //           <th className="py-2 text-left text-sm">Unit</th>
    //           <th className="py-2 text-right text-sm">Qty</th>
    //           <th className="py-2 text-right text-sm">Rate</th>
    //           <th className="py-2 text-right text-sm">Amount</th>
    //         </tr>
    //       </thead>
    //       <tbody>
    //         {challan.items.map((it, idx) => (
    //           <tr key={it.id} className="border-b">
    //             <td className="py-2 text-sm">{idx + 1}</td>
    //             <td className="py-2 text-sm">
    //               {it.material?.name ?? it.materialName ?? "-"}
    //             </td>
    //             <td className="py-2 text-sm">
    //               {it.material?.unit ?? it.unit ?? "-"}
    //             </td>
    //             <td className="py-2 text-sm text-right">
    //               {it.quantity.toFixed(2)}
    //             </td>
    //             <td className="py-2 text-sm text-right">{it.rate ?? "-"}</td>
    //             <td className="py-2 text-sm text-right">
    //               {formatCurrency(it.amount ?? 0)}
    //             </td>
    //           </tr>
    //         ))}
    //       </tbody>
    //     </table>
    //   </div>

    //   {/* Totals */}
    //   <div className="mt-6 flex justify-end">
    //     <div className="w-full max-w-sm space-y-1 text-sm">
    //       <div className="flex justify-between">
    //         <span>Total Qty</span>
    //         <span className="font-medium">
    //           {challan.totalQuantity.toFixed(2)}
    //         </span>
    //       </div>
    //       <div className="flex justify-between">
    //         <span>Total Amount</span>
    //         <span className="font-semibold">
    //           {formatCurrency(challan.totalAmount ?? 0)}
    //         </span>
    //       </div>
    //     </div>
    //   </div>

    //   {/* Footer */}
    //   <div className="mt-10 text-xs text-muted-foreground">
    //     This is a computer generated challan.
    //   </div>
    // </div>
    <div className="flex flex-col items-center gap-4 print:gap-0">
      {pages.map((group, index, list) => (
        <A4Page
          footer={<ChallanFooter businessName={challan.business.name} />}
          heading={<ChallanHeader header={challanHeader} />}
          table={<ChallanViewTable items={group} index={index + 1} />}
          onResize={() =>
            setPerPage((pp) => {
              const clone = pp.slice();
              clone[index] -= 1;
              clone[index + 1] = clone[index + 1] || 0;
              clone[index + 1] += 1;
              return clone;
            })
          }></A4Page>
      ))}
    </div>
  );
};

export default ChallanView;
