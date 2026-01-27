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
import { toggleMaterialActiveAction } from "@/lib/actions/material/toggleMaterialActive";
import { useRouter } from "next/navigation";
import { parseAsInteger, useQueryState } from "nuqs";
import React, { FC } from "react";
import MaterialsDialog from "./materials-dialog";
import { numberToPercentage } from "@/lib/format/numberToPercentage";

type MaterialRow = {
  id: string;
  name: string;
  unit: string;
  hsnCode: string | null;
  gstRate: number | null;
  isActive: boolean;
  createdAt: Date;
};
interface MaterialTableProps {
  items: MaterialRow[];
  total: number;
  page: number;
  totalPages: number;
}

const MaterialTable: FC<MaterialTableProps> = ({
  items,
  page,
  total,
  totalPages,
}) => {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [pageQ, setPageQ] = useQueryState(
    "page",
    parseAsInteger.withDefault(1)
  );

  async function onToggle(id: string) {
    setPendingId(id);
    await toggleMaterialActiveAction(id);
    setPendingId(null);
  }

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
            <TableHead>Name</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>HSN</TableHead>
            <TableHead>GST%</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell>{p.unit}</TableCell>
              <TableCell>{p.hsnCode ?? "-"}</TableCell>
              <TableCell className="">
                {numberToPercentage(p.gstRate) ?? "-"}
              </TableCell>

              <TableCell>
                <Badge variant={p.isActive ? "default" : "secondary"}>
                  {p.isActive ? "Active" : "Inactive"}
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
                        router.push(`/dashboard/materials/${p.id}`)
                      }>
                      View
                    </DropdownMenuItem>
                    <MaterialsDialog
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
                    />
                    <>
                      <DropdownMenuItem
                        onClick={() => toggleMaterialActiveAction(p.id)}>
                        {p.isActive ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                    </>
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

export default MaterialTable;
