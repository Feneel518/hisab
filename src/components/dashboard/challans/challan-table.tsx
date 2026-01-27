"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format/currency";
import { getFinancialYearKey, pad } from "@/lib/helpers/getFinancialYear";
import { useRouter } from "next/navigation";
import { parseAsInteger, useQueryState } from "nuqs";
import React, { FC } from "react";
type Challan = {
  id: string;
  challanNo: string | null;
  date: Date;
  party: {
    name: string;
  };
  purpose: string;
  items: { id: string }[];
  totalAmount: number | null;
  billingStatus: string;
};

interface ChallanTableProps {
  items: Challan[];
  total: number;
  page: number;
  totalPages: number;
}

const ChallanTable: FC<ChallanTableProps> = ({
  items,
  page,
  total,
  totalPages,
}) => {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [pageQ, setPageQ] = useQueryState(
    "page",
    parseAsInteger.withDefault(1),
  );

  return (
    <div className="rounded-xl border bg-background">
      <div className="flex items-center justify-between border-b border-muted rounded-t-xl p-3 bg-primary/30 ">
        <div className="text-sm text-muted-foreground">
          Showing {items.length} of {total}
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={page <= 1}
            onClick={() => {
              setPageQ(Math.max(1, pageQ - 1));
            }}>
            Prev
          </Button>
          <Button
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => {
              setPageQ(Math.max(1, pageQ + 1));
            }}>
            Next
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="h-12 border-primary">
            <TableHead>Challan No.</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Party Name</TableHead>
            <TableHead>Type / Purpose</TableHead>
            <TableHead>Total Items</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Billing Staus</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">
                {getFinancialYearKey(p.date)} - {pad(Number(p.challanNo), 4)}
              </TableCell>
              <TableCell>{p.date.toLocaleDateString()}</TableCell>
              <TableCell>{p.party?.name}</TableCell>
              <TableCell className="">
                <Badge>{p.purpose}</Badge>
              </TableCell>
              <TableCell className="">{p.items?.length}</TableCell>
              <TableCell className="">
                {formatCurrency(p.totalAmount!)}
              </TableCell>
              <TableCell className="">
                <Badge
                  className={
                    p.billingStatus === "UNBILLED"
                      ? "bg-red-600"
                      : "bg-green-600"
                  }>
                  {p.billingStatus}
                </Badge>
              </TableCell>

              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {pendingId === p.id ? "..." : "⋯"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/dashboard/challans/${p.id}/view`)
                      }>
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/dashboard/challans/${p.id}/edit`)
                      }>
                      Edit
                    </DropdownMenuItem>
                    {/* <MaterialsDialog
                      trigger={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          Edit
                        </DropdownMenuItem>
                      }
                      initial={{
                        id: p.id,
                        name: p.name,
                        gstRate: p.gstRate ?? undefined,
                        hsnCode: p.hsnCode ?? undefined,
                        unit: p.unit as
                          | "KG"
                          | "PCS"
                          | "MTR"
                          | "LTR"
                          | undefined,
                      }}
                    /> */}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}

          {items.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-10 text-center text-sm text-muted-foreground">
                No materials found.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
};

export default ChallanTable;
