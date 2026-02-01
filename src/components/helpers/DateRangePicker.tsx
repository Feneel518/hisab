"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DateRangePickerProps = {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  disabled?: boolean;

  // Optional: limit future dates, etc.
  disableAfterToday?: boolean;

  // Optional: show 2 months (nice UX)
  numberOfMonths?: number;
};

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Pick a date range",
  disabled,
  disableAfterToday,
  numberOfMonths = 2,
}: DateRangePickerProps) {
  const label = React.useMemo(() => {
    if (value?.from && value?.to) {
      return `${format(value.from, "dd MMM yyyy")} — ${format(
        value.to,
        "dd MMM yyyy",
      )}`;
    }
    if (value?.from) {
      return `${format(value.from, "dd MMM yyyy")} — ...`;
    }
    return placeholder;
  }, [value, placeholder]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value?.from && "text-muted-foreground",
          )}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          numberOfMonths={numberOfMonths}
          initialFocus
          disabled={disableAfterToday ? (date) => date > new Date() : undefined}
        />
      </PopoverContent>
    </Popover>
  );
}
