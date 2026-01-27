"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedValue } from "@/lib/helpers/debounce";
import { partiesParsers } from "@/lib/searchParams/parties.safe-parser";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import React, { FC } from "react";

interface ChallanToolbarProps {}

const ChallanToolbar: FC<ChallanToolbarProps> = ({}) => {
  const [{ q, active }, setParams] = useQueryStates(
    {
      q: partiesParsers.q,
      active: partiesParsers.active,
      page: partiesParsers.page,
    },
    {
      history: "push",
      shallow: false,
    }
  );

  // local typing state
  const [draft, setDraft] = React.useState(q);

  // keep input synced if URL changes via back/forward or external updates
  React.useEffect(() => {
    setDraft(q);
  }, [q]);

  const debouncedDraft = useDebouncedValue(draft, 400);

  // Apply debounced search to URL
  React.useEffect(() => {
    const nextQ = debouncedDraft.trim();

    // Prevent unnecessary URL writes
    if (nextQ === q.trim()) return;

    setParams({
      q: nextQ,
      page: 1, // reset paging on new search
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDraft]); // intentionally only depends on debouncedDraft
  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
      <div className="flex gap-2">
        <Input
          className="w-full sm:w-[260px] "
          placeholder="Search name, hsnCode... "
          defaultValue={q}
          onChange={(e) => setDraft(e.target.value)}
        />

        <Select
          value={active}
          onValueChange={(v) => {
            setParams({
              active: v as any,
              page: 1,
            });
          }}>
          <SelectTrigger className="w-[140px] ">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
            <SelectItem value="deleted">Deleted</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* <PartyDialog
        trigger={
          <Button className="w-full sm:w-auto" variant={"default"}>
            <Plus></Plus>Create Party
          </Button>
        }
      /> */}

      <Button asChild className="w-full sm:w-auto" variant={"default"}>
        <Link href={"/dashboard/challans/new"}>
          <Plus></Plus>Create Challan
        </Link>
      </Button>
    </div>
  );
};

export default ChallanToolbar;
