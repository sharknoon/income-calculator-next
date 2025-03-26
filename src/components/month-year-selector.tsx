"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Temporal } from "@js-temporal/polyfill";
import { useEffect, useState } from "react";

interface MonthYearSelectorProps {
  onChange?: (date: Temporal.PlainYearMonth) => void;
  onApply?: (date: Temporal.PlainYearMonth) => void;
  defaultValue?: Temporal.PlainYearMonth;
}

export function MonthYearSelector({
  onChange,
  onApply,
  defaultValue = Temporal.Now.plainDateISO().toPlainYearMonth(),
}: MonthYearSelectorProps) {
  const [date, setDate] = useState<Temporal.PlainYearMonth>(defaultValue);

  useEffect(() => onChange?.(date), [onChange, date]);

  // Generate a range of years (current year - 100 to current year + 10)
  const currentYear = Temporal.Now.plainDateISO().year;
  const years = Array.from({ length: 111 }, (_, i) => currentYear - 100 + i);

  const handleMonthChange = (value: string) => {
    setDate(date.with({ month: Number.parseInt(value) }));
  };

  const handleYearChange = (value: string) => {
    setDate(date.with({ year: Number.parseInt(value) }));
  };

  const navigateMonth = (direction: number) => {
    setDate(date.add({ months: direction }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
          <ChevronLeft className="size-4" />
        </Button>
        <div className="font-medium">
          {date.toLocaleString(undefined, {
            calendar: date.getCalendar(),
            month: "long",
            year: "numeric",
          })}
        </div>
        <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Month</label>
          <Select
            value={date.month.toString()}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(12)].map((_, index) => (
                <SelectItem key={index} value={(index + 1).toString()}>
                  {Temporal.PlainYearMonth.from({
                    year: date.year,
                    month: index + 1,
                  }).toLocaleString(undefined, {
                    calendar: "iso8601",
                    month: "long",
                  })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Year</label>
          <Select value={date.year.toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((yearValue) => (
                <SelectItem key={yearValue} value={yearValue.toString()}>
                  {yearValue}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button className="w-full" onClick={() => onApply?.(date)}>
        Apply
      </Button>
    </div>
  );
}
