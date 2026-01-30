"use client";

import * as React from "react";

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
import { Badge } from "@/components/ui/badge";
import { parseAsInteger, useQueryState } from "nuqs";
import PartyDialog from "./parties-dialog";
import { togglePartyActive } from "@/lib/actions/party/togglePartyActive";
import { restoreParty } from "@/lib/actions/party/restoreParty";
import { softDeleteParty } from "@/lib/actions/party/deleteParty";
import { useRouter } from "next/navigation";

type PartyRow = {
  id: string;
  name: string;
  kind: "CUSTOMER" | "SUPPLIER" | "JOBWORKER" | "OTHER";
  addressLine1: string | null;
  phone: string | null;
  gstin: string | null;
  city: string | null;
  isActive: boolean;
  createdAt: string | Date;
  deletedAt: Date | null;
};

export default function PartiesTable({
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
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [pageQ, setPageQ] = useQueryState(
    "page",
    parseAsInteger.withDefault(1),
  );

  async function onToggle(id: string) {
    setPendingId(id);
    await togglePartyActive(id);
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
            <TableHead>Kind</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>GSTIN</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-20 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell>{p.kind}</TableCell>
              <TableCell>{p.phone ?? "-"}</TableCell>
              <TableCell className="font-mono text-xs">
                {p.gstin ?? "-"}
              </TableCell>
              <TableCell>{p.city ?? "-"}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    p.deletedAt
                      ? "destructive"
                      : p.isActive
                        ? "default"
                        : "secondary"
                  }>
                  {p.deletedAt ? "Deleted" : p.isActive ? "Active" : "Inactive"}
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
                      onClick={() => router.push(`/dashboard/parties/${p.id}`)}>
                      View
                    </DropdownMenuItem>
                    <PartyDialog
                      trigger={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          Edit
                        </DropdownMenuItem>
                      }
                      initial={{
                        id: p.id,
                        name: p.name,
                        kind: p.kind,
                        phone: p.phone ?? "",
                        gstin: p.gstin ?? "",
                        city: p.city ?? "",
                        addressLine1: p.addressLine1 ?? "",
                      }}
                    />
                    {p.deletedAt ? (
                      <DropdownMenuItem onClick={() => restoreParty(p.id)}>
                        Restore
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <DropdownMenuItem
                          onClick={() => togglePartyActive(p.id)}>
                          {p.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => softDeleteParty(p.id)}>
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
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
                No parties found.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
