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
import MaterialsDialog from "../dashboard/materials/materials-dialog";

type Material = {
  id: string;
  name: string;
  unit: string;
  defaultRate?: number | null;
};

interface MaterialSelectProps {
  materials: Material[];
  value?: string | null;
  onSelect: (material: Material) => void;
}

export function MaterialSelect({
  materials,
  value,
  onSelect,
}: MaterialSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selected = materials.find((m) => m.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between">
          {selected ? selected.name : "Select material"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-(--radix-popover-trigger-width)">
        <Command>
          <CommandInput placeholder="Search material..." />
          <CommandEmpty>No material found.</CommandEmpty>

          <CommandGroup>
            <CommandItem className="hover:bg-transparent">
              <MaterialsDialog
                trigger={
                  <Button className="w-full">
                    <Plus className="text-muted"></Plus>Create Material
                  </Button>
                }></MaterialsDialog>
            </CommandItem>
            {materials.map((material) => (
              <CommandItem
                key={material.id}
                value={material.name}
                onSelect={() => {
                  onSelect(material);
                  setOpen(false);
                }}>
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === material.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span>{material.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Unit: {material.unit}
                    {material.defaultRate ? ` • ₹${material.defaultRate}` : ""}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
