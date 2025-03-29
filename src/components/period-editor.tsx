"use client";

import { Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Monthly, MonthPosition, Period } from "@/lib/types";
import { tzDateToPlainDate, plainDateToTZDate } from "@/lib/date";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Temporal } from "@js-temporal/polyfill";
import { useState } from "react";
import { TZDate } from "react-day-picker";

interface PeriodEditorProps {
  period: Period;
  onPeriodChange: (period: Period) => void;
}

export function PeriodEditor({ period, onPeriodChange }: PeriodEditorProps) {
  const [isStartDateCalendarOpen, setIsStartDateCalendarOpen] = useState(false);
  const [isEndDateCalendarOpen, setIsEndDateCalendarOpen] = useState(false);

  const handleFrequencyChange = (value: Period["frequency"]) => {
    const basePeriod = {
      startDate: period.startDate,
      endDate: period.endDate,
    };

    let newPeriod: Period;
    switch (value) {
      case "daily":
        newPeriod = {
          ...basePeriod,
          frequency: value,
          every: 1,
        };
        break;
      case "weekly":
        newPeriod = {
          ...basePeriod,
          frequency: value,
          every: 1,
          weekdays: ["monday"],
        };
        break;
      case "monthly":
        newPeriod = {
          ...basePeriod,
          frequency: value,
          every: 1,
          dayOfMonthType: "position",
          on: "last",
          day: "weekday",
        };
        break;
      case "yearly":
        newPeriod = {
          ...basePeriod,
          frequency: value,
          every: 1,
          months: ["january"],
          dayOfMonthType: "position",
          on: "last",
          day: "weekday",
        };
        break;
    }

    onPeriodChange(newPeriod);
  };

  const handleDayOfMonthTypeChange = (value: Monthly["dayOfMonthType"]) => {
    if (period.frequency !== "monthly" && period.frequency !== "yearly") {
      return;
    }

    const basePeriod = {
      startDate: period.startDate,
      endDate: period.endDate,
      every: period.every,
    };

    // Create the default day/position configurations
    const dayConfig = {
      dayOfMonthType: "day" as const,
      each: 1,
    };

    const positionConfig = {
      dayOfMonthType: "position" as const,
      on: "last" as const,
      day: "weekday" as const,
    };

    const typeConfig = value === "day" ? dayConfig : positionConfig;

    if (period.frequency === "monthly") {
      const newPeriod: Period = {
        ...basePeriod,
        ...typeConfig,
        frequency: period.frequency,
      };
      onPeriodChange(newPeriod);
    } else {
      const newPeriod: Period = {
        ...basePeriod,
        ...typeConfig,
        frequency: period.frequency,
        months: period.months,
      };
      onPeriodChange(newPeriod);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover
            open={isStartDateCalendarOpen}
            onOpenChange={setIsStartDateCalendarOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left"
              >
                <Calendar className="mr-2 size-4" />
                {period.startDate.toLocaleString()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                timeZone="UTC"
                mode="single"
                selected={plainDateToTZDate(period.startDate)}
                defaultMonth={plainDateToTZDate(period.startDate)}
                onSelect={(date) => {
                  if (date) {
                    const startDate = tzDateToPlainDate(
                      new TZDate(date, "UTC"),
                    );
                    // Don't allow the startDate to be after the endDate
                    if (
                      period.endDate &&
                      Temporal.PlainDate.compare(startDate, period.endDate) > 0
                    ) {
                      period.endDate = startDate;
                    }
                    onPeriodChange({
                      ...period,
                      startDate,
                    });
                    setIsStartDateCalendarOpen(false);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>End Date (optional)</Label>
          <Popover
            open={isEndDateCalendarOpen}
            onOpenChange={setIsEndDateCalendarOpen}
          >
            <div className="flex w-full">
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "grow justify-start text-left",
                    !period.endDate && "text-muted-foreground",
                    period.endDate && "rounded-r-none",
                  )}
                >
                  <Calendar className="mr-2 size-4" />
                  {period.endDate ? (
                    period.endDate.toLocaleString()
                  ) : (
                    <span>No end date</span>
                  )}
                </Button>
              </PopoverTrigger>
              {period.endDate && (
                <Button
                  className="rounded-l-none border-l-0"
                  variant="outline"
                  onClick={() =>
                    onPeriodChange({ ...period, endDate: undefined })
                  }
                >
                  <X />
                </Button>
              )}
            </div>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                timeZone="UTC"
                mode="single"
                disabled={{ before: plainDateToTZDate(period.startDate) }}
                selected={
                  period.endDate ? plainDateToTZDate(period.endDate) : undefined
                }
                defaultMonth={
                  period.endDate ? plainDateToTZDate(period.endDate) : undefined
                }
                onSelect={(date) => {
                  if (date) {
                    onPeriodChange({
                      ...period,
                      endDate: tzDateToPlainDate(new TZDate(date, "UTC")),
                    });
                    setIsEndDateCalendarOpen(false);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Frequency</Label>
        <Select value={period.frequency} onValueChange={handleFrequencyChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="every">Repeat every</Label>
        <div className="flex items-center gap-2">
          <Input
            id="every"
            type="number"
            min={1}
            value={period.every}
            onChange={(e) =>
              onPeriodChange({
                ...period,
                every: Number.parseInt(e.target.value) || 1,
              })
            }
            className="w-20"
          />
          <span>
            {period.frequency === "daily" && "day(s)"}
            {period.frequency === "weekly" && "week(s)"}
            {period.frequency === "monthly" && "month(s)"}
            {period.frequency === "yearly" && "year(s)"}
          </span>
        </div>
      </div>

      {period.frequency === "weekly" && (
        <div className="space-y-2">
          <Label>Repeat on</Label>
          <div className="flex flex-wrap gap-2">
            {(
              [
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday",
              ] as const
            ).map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={`weekday-${day}`}
                  checked={period.weekdays.includes(day)}
                  onCheckedChange={(checked) => {
                    onPeriodChange({
                      ...period,
                      weekdays: checked
                        ? [...period.weekdays, day]
                        : period.weekdays.filter((d) => d !== day),
                    });
                  }}
                />
                <Label
                  htmlFor={`weekday-${day}`}
                  className="text-sm capitalize"
                >
                  {day}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {period.frequency === "monthly" && (
        <div className="space-y-4">
          <RadioGroup
            value={period.dayOfMonthType}
            onValueChange={handleDayOfMonthTypeChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="day" id="monthly-day" />
              <div className="flex items-center gap-2">
                <Label htmlFor="monthly-day">Day</Label>
                <Input
                  type="number"
                  min={1}
                  max={31}
                  value={period.dayOfMonthType === "day" ? period.each : 1}
                  onChange={(e) =>
                    period.dayOfMonthType === "day" &&
                    onPeriodChange({
                      ...period,
                      each: Number.parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-16"
                  disabled={period.dayOfMonthType !== "day"}
                />
                <span>of the month</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="position" id="monthly-position" />
              <div className="flex items-center gap-2">
                <Label htmlFor="monthly-position">The</Label>
                <Select
                  value={
                    period.dayOfMonthType === "position" ? period.on : "last"
                  }
                  onValueChange={(value: MonthPosition["on"]) =>
                    period.dayOfMonthType === "position" &&
                    onPeriodChange({
                      ...period,
                      on: value,
                    })
                  }
                  disabled={period.dayOfMonthType !== "position"}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first">First</SelectItem>
                    <SelectItem value="second">Second</SelectItem>
                    <SelectItem value="third">Third</SelectItem>
                    <SelectItem value="fourth">Fourth</SelectItem>
                    <SelectItem value="fifth">Fifth</SelectItem>
                    <SelectItem value="next-to-last">Next to last</SelectItem>
                    <SelectItem value="last">Last</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={
                    period.dayOfMonthType === "position"
                      ? period.day
                      : "weekday"
                  }
                  onValueChange={(value: MonthPosition["day"]) =>
                    period.dayOfMonthType === "position" &&
                    onPeriodChange({
                      ...period,
                      day: value,
                    })
                  }
                  disabled={period.dayOfMonthType !== "position"}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                    <SelectItem value="saturday">Saturday</SelectItem>
                    <SelectItem value="sunday">Sunday</SelectItem>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="weekday">Weekday</SelectItem>
                    <SelectItem value="weekend-day">Weekend day</SelectItem>
                  </SelectContent>
                </Select>
                <span>of the month</span>
              </div>
            </div>
          </RadioGroup>
        </div>
      )}

      {period.frequency === "yearly" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Months</Label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  "january",
                  "february",
                  "march",
                  "april",
                  "may",
                  "june",
                  "july",
                  "august",
                  "september",
                  "october",
                  "november",
                  "december",
                ] as const
              ).map((month) => (
                <div key={month} className="flex items-center space-x-2">
                  <Checkbox
                    id={`month-${month}`}
                    checked={period.months.includes(month)}
                    onCheckedChange={(checked) => {
                      onPeriodChange({
                        ...period,
                        months: checked
                          ? [...period.months, month]
                          : period.months.filter((m) => m !== month),
                      });
                    }}
                  />
                  <Label
                    htmlFor={`month-${month}`}
                    className="text-sm capitalize"
                  >
                    {month}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <RadioGroup
            value={period.dayOfMonthType}
            onValueChange={handleDayOfMonthTypeChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="day" id="yearly-day" />
              <div className="flex items-center gap-2">
                <Label htmlFor="yearly-day">Day</Label>
                <Input
                  type="number"
                  min={1}
                  max={31}
                  value={period.dayOfMonthType === "day" ? period.each : 1}
                  onChange={(e) =>
                    period.dayOfMonthType === "day" &&
                    onPeriodChange({
                      ...period,
                      each: Number.parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-16"
                  disabled={period.dayOfMonthType !== "day"}
                />
                <span>of the month</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="position" id="yearly-position" />
              <div className="flex items-center gap-2">
                <Label htmlFor="yearly-position">The</Label>
                <Select
                  value={
                    period.dayOfMonthType === "position" ? period.on : "last"
                  }
                  onValueChange={(value: MonthPosition["on"]) =>
                    period.dayOfMonthType === "position" &&
                    onPeriodChange({
                      ...period,
                      on: value,
                    })
                  }
                  disabled={period.dayOfMonthType !== "position"}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first">First</SelectItem>
                    <SelectItem value="second">Second</SelectItem>
                    <SelectItem value="third">Third</SelectItem>
                    <SelectItem value="fourth">Fourth</SelectItem>
                    <SelectItem value="fifth">Fifth</SelectItem>
                    <SelectItem value="next-to-last">Next to last</SelectItem>
                    <SelectItem value="last">Last</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={
                    period.dayOfMonthType === "position"
                      ? period.day
                      : "weekday"
                  }
                  onValueChange={(value: MonthPosition["day"]) =>
                    period.dayOfMonthType === "position" &&
                    onPeriodChange({
                      ...period,
                      day: value,
                    })
                  }
                  disabled={period.dayOfMonthType !== "position"}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                    <SelectItem value="saturday">Saturday</SelectItem>
                    <SelectItem value="sunday">Sunday</SelectItem>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="weekday">Weekday</SelectItem>
                    <SelectItem value="weekend-day">Weekend day</SelectItem>
                  </SelectContent>
                </Select>
                <span>of the month</span>
              </div>
            </div>
          </RadioGroup>
        </div>
      )}
    </div>
  );
}
