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
import type { MonthlyPosition, Period } from "@/types/income";
import { jsDateToPlainDate, plainDateToJsDate } from "@/lib/date";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface PeriodEditorProps {
  period: Period;
  onPeriodChange: (period: Period) => void;
}

export function PeriodEditor({ period, onPeriodChange }: PeriodEditorProps) {
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
          weekdays: ["Monday"],
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
          months: ["January"],
          dayOfMonthType: "position",
          on: "last",
          day: "weekday",
        };
        break;
    }

    onPeriodChange(newPeriod);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {period.startDate.toLocaleString()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                timeZone="UTC"
                mode="single"
                selected={plainDateToJsDate(period.startDate)}
                onSelect={(date) => {
                  if (date) {
                    onPeriodChange({
                      ...period,
                      startDate: jsDateToPlainDate(date),
                    });
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>End Date (optional)</Label>
          <Popover>
            <div className="flex w-full">
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "grow justify-start text-left",
                    !period.endDate && "text-muted-foreground",
                    period.endDate && "rounded-r-none"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
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
                selected={plainDateToJsDate(period.endDate || period.startDate)}
                onSelect={(date) => {
                  if (date) {
                    onPeriodChange({
                      ...period,
                      endDate: jsDateToPlainDate(date),
                    });
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
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
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
                <Label htmlFor={`weekday-${day}`} className="text-sm">
                  {day}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {period.frequency === "monthly" && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="monthly-day"
              checked={period.dayOfMonthType === "day"}
              onCheckedChange={(checked) => {
                if (checked && period.dayOfMonthType !== "day") {
                  onPeriodChange({
                    ...period,
                    dayOfMonthType: "day",
                    each: 1,
                  });
                }
              }}
            />
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
            <Checkbox
              id="monthly-position"
              checked={period.dayOfMonthType === "position"}
              onCheckedChange={(checked) => {
                if (checked && period.dayOfMonthType !== "position") {
                  onPeriodChange({
                    ...period,
                    dayOfMonthType: "position",
                    on: "last",
                    day: "weekday",
                  });
                }
              }}
            />
            <div className="flex items-center gap-2">
              <Label htmlFor="monthly-position">The</Label>
              <Select
                value={
                  period.dayOfMonthType === "position" ? period.on : "last"
                }
                onValueChange={(value: MonthlyPosition["on"]) =>
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
                  <SelectItem value="next-to-last">Next to last</SelectItem>
                  <SelectItem value="last">Last</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={
                  period.dayOfMonthType === "position" ? period.day : "weekday"
                }
                onValueChange={(value: MonthlyPosition["day"]) =>
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
                  <SelectItem value="Monday">Monday</SelectItem>
                  <SelectItem value="Tuesday">Tuesday</SelectItem>
                  <SelectItem value="Wednesday">Wednesday</SelectItem>
                  <SelectItem value="Thursday">Thursday</SelectItem>
                  <SelectItem value="Friday">Friday</SelectItem>
                  <SelectItem value="Saturday">Saturday</SelectItem>
                  <SelectItem value="Sunday">Sunday</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="weekday">Weekday</SelectItem>
                  <SelectItem value="weekend-day">Weekend day</SelectItem>
                </SelectContent>
              </Select>
              <span>of the month</span>
            </div>
          </div>
        </div>
      )}

      {period.frequency === "yearly" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Months</Label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
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
                  <Label htmlFor={`month-${month}`} className="text-sm">
                    {month}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="yearly-day"
              checked={period.dayOfMonthType === "day"}
              onCheckedChange={(checked) => {
                if (checked && period.dayOfMonthType !== "day") {
                  onPeriodChange({
                    ...period,
                    dayOfMonthType: "day",
                    each: 1,
                  });
                }
              }}
            />
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
            <Checkbox
              id="yearly-position"
              checked={period.dayOfMonthType === "position"}
              onCheckedChange={(checked) => {
                if (checked && period.dayOfMonthType !== "position") {
                  onPeriodChange({
                    ...period,
                    dayOfMonthType: "position",
                    on: "last",
                    day: "weekday",
                  });
                }
              }}
            />
            <div className="flex items-center gap-2">
              <Label htmlFor="yearly-position">The</Label>
              <Select
                value={
                  period.dayOfMonthType === "position" ? period.on : "last"
                }
                onValueChange={(value: MonthlyPosition["on"]) =>
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
                  <SelectItem value="last">Last</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={
                  period.dayOfMonthType === "position" ? period.day : "weekday"
                }
                onValueChange={(value: MonthlyPosition["day"]) =>
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
                  <SelectItem value="Monday">Monday</SelectItem>
                  <SelectItem value="Tuesday">Tuesday</SelectItem>
                  <SelectItem value="Wednesday">Wednesday</SelectItem>
                  <SelectItem value="Thursday">Thursday</SelectItem>
                  <SelectItem value="Friday">Friday</SelectItem>
                  <SelectItem value="Saturday">Saturday</SelectItem>
                  <SelectItem value="Sunday">Sunday</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="weekday">Weekday</SelectItem>
                  <SelectItem value="weekend-day">Weekend day</SelectItem>
                </SelectContent>
              </Select>
              <span>of the month</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
