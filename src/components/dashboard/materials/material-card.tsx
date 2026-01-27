"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import React, { FC } from "react";
import MaterialsDialog from "./materials-dialog";
import { parseAsInteger, useQueryState } from "nuqs";
import { toggleMaterialActiveAction } from "@/lib/actions/material/toggleMaterialActive";
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
interface MaterialCardProps {
  items: MaterialRow[];
  total: number;
  page: number;
  totalPages: number;
}

const MaterialCard: FC<MaterialCardProps> = ({
  items,
  page,
  total,
  totalPages,
}) => {
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
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          Showing {items.length} of {total}
        </span>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => {
              setPageQ(Math.max(1, pageQ - 1));
            }}>
            Prev
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => {
              setPageQ(Math.max(1, pageQ + 1));
            }}>
            Next
          </Button>
        </div>
      </div>

      {items.map((p) => (
        <Card key={p.id} className="rounded-xl py-4 pb-1">
          <CardContent className="px-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-base font-semibold">{p.name}</div>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{p.hsnCode}</span>
                  <span>{numberToPercentage(p.gstRate) ?? "-"}</span>
                  <span className="font-mono">{p.unit ?? "-"}</span>
                </div>
              </div>

              <Badge variant={p.isActive ? "default" : "secondary"}>
                {p.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="mt-4 flex justify-between z-10">
              <Button size={"sm"} variant="link" className="z-10" asChild>
                <Link href={`/dashboard/parties/${p.id}`}>View</Link>
              </Button>
              <MaterialsDialog
                trigger={
                  <Button variant="link" size={"sm"} className="z-10">
                    Edit
                  </Button>
                }
                initial={{
                  id: p.id,
                  name: p.name,
                  gstRate: p.gstRate ?? undefined,
                  hsnCode: p.hsnCode ?? undefined,
                  unit: p.unit as "KG" | "PCS" | "MTR" | "LTR" | undefined,
                }}
              />

              <>
                <Button variant={"link"} onClick={() => onToggle(p.id)}>
                  {p.isActive ? "Deactivate" : "Activate"}
                </Button>
              </>
            </div>
          </CardContent>
        </Card>
      ))}

      {items.length === 0 ? (
        <div className="rounded-xl border p-10 text-center text-sm text-muted-foreground">
          No parties found.
        </div>
      ) : null}
    </div>
  );
};

export default MaterialCard;
