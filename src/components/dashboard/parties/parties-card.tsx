"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import PartyDialog from "./parties-dialog";
import { parseAsInteger, useQueryState } from "nuqs";
import { togglePartyActive } from "@/lib/actions/party/togglePartyActive";
import Link from "next/link";
import { restoreParty } from "@/lib/actions/party/restoreParty";
import { softDeleteParty } from "@/lib/actions/party/deleteParty";

type PartyRow = {
  id: string;
  name: string;
  kind: "CUSTOMER" | "SUPPLIER" | "JOBWORKER" | "OTHER";
  phone: string | null;
  gstin: string | null;
  city: string | null;
  isActive: boolean;
  deletedAt: Date | null;
};

export default function PartiesCards({
  items,
  total,
  page,
  totalPages,
}: {
  items: PartyRow[];
  total: number;
  page: number;
  totalPages: number;
}) {
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [pageQ, setPageQ] = useQueryState(
    "page",
    parseAsInteger.withDefault(1)
  );

  async function onToggle(id: string) {
    setPendingId(id);
    await togglePartyActive(id);
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
        <Card key={p.id} className="rounded-xl">
          <CardContent className="px-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-base font-semibold">{p.name}</div>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{p.kind}</span>
                  <span>{p.city ?? "-"}</span>
                  <span className="font-mono">{p.gstin ?? "-"}</span>
                </div>
              </div>

              <Badge variant={p.isActive ? "default" : "secondary"}>
                {p.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="mt-4 flex gap-2 z-10">
              <Button size={"sm"} variant="link" className="z-10" asChild>
                <Link href={`/dashboard/parties/${p.id}`}>View</Link>
              </Button>
              <PartyDialog
                trigger={
                  <Button variant="link" size={"sm"} className="z-10">
                    Edit
                  </Button>
                }
                initial={{
                  id: p.id,
                  name: p.name,
                  kind: p.kind,
                  phone: p.phone ?? "",
                  gstin: p.gstin ?? "",
                  city: p.city ?? "",
                }}
              />
              {p.deletedAt ? (
                <Button variant={"link"} onClick={() => restoreParty(p.id)}>
                  Restore
                </Button>
              ) : (
                <>
                  <Button variant={"link"} onClick={() => onToggle(p.id)}>
                    {p.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant={"link"}
                    className="text-destructive"
                    onClick={() => softDeleteParty(p.id)}>
                    Delete
                  </Button>
                </>
              )}
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
}
