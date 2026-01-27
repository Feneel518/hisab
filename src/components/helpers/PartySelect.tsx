"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import PartyDialog from "../dashboard/parties/parties-dialog";

type Party = {
  id: string;
  name: string;
  kind?: string;
};

interface PartySelectProps {
  parties: Party[];
  value?: string;
  onChange: (partyId: string) => void;
}

export function PartySelect({ parties, value, onChange }: PartySelectProps) {
  const [open, setOpen] = React.useState(false);

  const selected = parties.find((p) => p.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between">
          {selected ? selected.name : "Select party"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput placeholder="Search party..." />
          <CommandEmpty>No party found.</CommandEmpty>

          <CommandGroup>
            <CommandItem className="hover:bg-transparent">
              <PartyDialog
                trigger={
                  <Button className="w-full">
                    <Plus className="text-muted"></Plus>Create Party
                  </Button>
                }></PartyDialog>
            </CommandItem>
            {parties.map((party) => (
              <CommandItem
                key={party.id}
                value={party.id}
                onSelect={() => {
                  onChange(party.id);
                  setOpen(false);
                }}>
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === party.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span>{party.name}</span>
                  {party.kind && (
                    <span className="text-xs text-muted-foreground">
                      {party.kind}
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
