"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { useComponents } from "@/context/components-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import type { Component, Period, Recurring } from "@/types/income";
import { Temporal } from "@js-temporal/polyfill";
import { jsDateToPlainDate, plainDateToJsDate } from "@/lib/utils";

interface PeriodEditorProps {
  component: Component;
}

export function PeriodEditor({ component }: PeriodEditorProps) {
  const { updateComponent } = useComponents();
  const period = component.periods[0] || {
    date: {
      type: "recurring",
      startDate: Temporal.Now.plainDateISO().with({ day: 1 }),
      frequency: "monthly",
      every: 1,
      each: 1,
    },
    dependencies: [],
    inputs: [],
    calculate: "new BigNumber(0)",
  };

  const [periodType, setPeriodType] = useState(period.date.type);
  const [frequency, setFrequency] = useState(
    period.date.type === "recurring" ? period.date.frequency : "monthly"
  );

  const handlePeriodTypeChange = (value: typeof periodType) => {
    setPeriodType(value);

    // Update the component with the new period type
    const newPeriod = { ...period };
    if (value === "one-time") {
      newPeriod.date = {
        type: "one-time",
        date:
          period.date.type === "one-time"
            ? period.date.date
            : period.date.startDate,
      };
    } else {
      newPeriod.date = {
        type: "recurring",
        startDate:
          period.date.type === "one-time"
            ? period.date.date
            : period.date.startDate,
        frequency: frequency as any,
        every: 1,
        each: 1,
      };
    }

    updateComponent({
      ...component,
      periods: [newPeriod],
    });
  };

  const handleFrequencyChange = (value: typeof frequency) => {
    setFrequency(value);

    if (period.date.type === "recurring") {
      const newPeriod = { ...period };
      newPeriod.date = {
        ...(newPeriod.date as any),
        frequency: value,
      };

      // Add appropriate properties based on frequency
      if (value === "daily") {
        (newPeriod.date as any).every = 1;
      } else if (value === "weekly") {
        (newPeriod.date as any).every = 1;
        (newPeriod.date as any).weekdays = ["Monday"];
      } else if (value === "monthly") {
        (newPeriod.date as any).every = 1;
        (newPeriod.date as any).each = 1;
      } else if (value === "yearly") {
        (newPeriod.date as any).every = 1;
        (newPeriod.date as any).months = ["January"];
        (newPeriod.date as any).each = 1;
      }

      updateComponent({
        ...component,
        periods: [newPeriod],
      });
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "";
    return `${date.year}-${String(date.month).padStart(2, "0")}-${String(
      date.day
    ).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Period Type</Label>
        <RadioGroup
          value={periodType}
          onValueChange={handlePeriodTypeChange}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="one-time" id="one-time" />
            <Label htmlFor="one-time">One-time</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="recurring" id="recurring" />
            <Label htmlFor="recurring">Recurring</Label>
          </div>
        </RadioGroup>
      </div>

      {periodType === "one-time" && (
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {period.date.type === "one-time"
                  ? formatDate(period.date.date)
                  : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                timeZone="UTC"
                mode="single"
                selected={plainDateToJsDate(Temporal.Now.plainDateISO())}
                onSelect={(date) => {
                  if (date) {
                    const newPeriod = { ...period };
                    newPeriod.date = {
                      type: "one-time",
                      date: jsDateToPlainDate(date),
                    };

                    updateComponent({
                      ...component,
                      periods: [newPeriod],
                    });
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {periodType === "recurring" && (
        <>
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {period.date.type === "recurring"
                    ? formatDate(period.date.startDate)
                    : "Select start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  timeZone="UTC"
                  mode="single"
                  selected={plainDateToJsDate(Temporal.Now.plainDateISO())}
                  onSelect={(date) => {
                    if (date && period.date.type === "recurring") {
                      const newPeriod = {
                        ...period,
                      } as Period & { date: Recurring };
                      newPeriod.date = {
                        ...newPeriod.date,
                        startDate: jsDateToPlainDate(date),
                      };

                      updateComponent({
                        ...component,
                        periods: [newPeriod],
                      });
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={handleFrequencyChange}>
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

          {frequency === "daily" && (
            <div className="space-y-2">
              <Label>Every</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="1"
                  value={
                    period.date.type === "recurring" && "every" in period.date
                      ? period.date.every
                      : 1
                  }
                  onChange={(e) => {
                    if (period.date.type === "recurring") {
                      const newPeriod = { ...period };
                      (newPeriod.date as any).every =
                        Number.parseInt(e.target.value) || 1;

                      updateComponent({
                        ...component,
                        periods: [newPeriod],
                      });
                    }
                  }}
                  className="w-20"
                />
                <span>day(s)</span>
              </div>
            </div>
          )}

          {frequency === "weekly" && (
            <>
              <div className="space-y-2">
                <Label>Every</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="1"
                    value={
                      period.date.type === "recurring" && "every" in period.date
                        ? period.date.every
                        : 1
                    }
                    onChange={(e) => {
                      if (period.date.type === "recurring") {
                        const newPeriod = { ...period };
                        (newPeriod.date as any).every =
                          Number.parseInt(e.target.value) || 1;

                        updateComponent({
                          ...component,
                          periods: [newPeriod],
                        });
                      }
                    }}
                    className="w-20"
                  />
                  <span>week(s)</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>On</Label>
                <div className="grid grid-cols-4 gap-2">
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
                    <Button
                      key={day}
                      variant="outline"
                      className={`${
                        period.date.type === "recurring" &&
                        "weekdays" in period.date &&
                        period.date.weekdays.includes(day)
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }`}
                      onClick={() => {
                        if (period.date.type === "recurring") {
                          const newPeriod = { ...period };
                          if (!("weekdays" in newPeriod.date)) {
                            (newPeriod.date as any).weekdays = [];
                          }

                          const weekdays = [
                            ...(newPeriod.date as any).weekdays,
                          ];
                          if (weekdays.includes(day)) {
                            (newPeriod.date as any).weekdays = weekdays.filter(
                              (d) => d !== day
                            );
                          } else {
                            (newPeriod.date as any).weekdays = [
                              ...weekdays,
                              day,
                            ];
                          }

                          updateComponent({
                            ...component,
                            periods: [newPeriod],
                          });
                        }
                      }}
                    >
                      {day.substring(0, 3)}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}

          {frequency === "monthly" && (
            <>
              <div className="space-y-2">
                <Label>Every</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="1"
                    value={
                      period.date.type === "recurring" && "every" in period.date
                        ? period.date.every
                        : 1
                    }
                    onChange={(e) => {
                      if (period.date.type === "recurring") {
                        const newPeriod = { ...period };
                        (newPeriod.date as any).every =
                          Number.parseInt(e.target.value) || 1;

                        updateComponent({
                          ...component,
                          periods: [newPeriod],
                        });
                      }
                    }}
                    className="w-20"
                  />
                  <span>month(s)</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>On the</Label>
                <RadioGroup
                  value={
                    period.date.type === "recurring" && "each" in period.date
                      ? "day"
                      : "weekday"
                  }
                  onValueChange={(value) => {
                    if (period.date.type === "recurring") {
                      const newPeriod = { ...period };
                      if (value === "day") {
                        delete (newPeriod.date as any).day;
                        delete (newPeriod.date as any).on;
                        (newPeriod.date as any).each = 1;
                      } else {
                        delete (newPeriod.date as any).each;
                        (newPeriod.date as any).day = "Monday";
                        (newPeriod.date as any).on = "first";
                      }

                      updateComponent({
                        ...component,
                        periods: [newPeriod],
                      });
                    }
                  }}
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="day" id="day-of-month" />
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min="1"
                        max="31"
                        disabled={
                          !(
                            period.date.type === "recurring" &&
                            "each" in period.date
                          )
                        }
                        value={
                          period.date.type === "recurring" &&
                          "each" in period.date
                            ? period.date.each
                            : 1
                        }
                        onChange={(e) => {
                          if (
                            period.date.type === "recurring" &&
                            "each" in period.date
                          ) {
                            const newPeriod = { ...period };
                            (newPeriod.date as any).each =
                              Number.parseInt(e.target.value) || 1;

                            updateComponent({
                              ...component,
                              periods: [newPeriod],
                            });
                          }
                        }}
                        className="w-20"
                      />
                      <Label htmlFor="day-of-month">day of the month</Label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekday" id="weekday-of-month" />
                    <div className="flex items-center space-x-2">
                      <Select
                        disabled={
                          !(
                            period.date.type === "recurring" &&
                            "on" in period.date
                          )
                        }
                        value={
                          period.date.type === "recurring" &&
                          "on" in period.date
                            ? period.date.on
                            : "first"
                        }
                        onValueChange={(value) => {
                          if (
                            period.date.type === "recurring" &&
                            "on" in period.date
                          ) {
                            const newPeriod = { ...period };
                            (newPeriod.date as any).on = value;

                            updateComponent({
                              ...component,
                              periods: [newPeriod],
                            });
                          }
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="first">First</SelectItem>
                          <SelectItem value="second">Second</SelectItem>
                          <SelectItem value="third">Third</SelectItem>
                          <SelectItem value="fourth">Fourth</SelectItem>
                          <SelectItem value="fifth">Next to last</SelectItem>
                          <SelectItem value="last">Last</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        disabled={
                          !(
                            period.date.type === "recurring" &&
                            "day" in period.date
                          )
                        }
                        value={
                          period.date.type === "recurring" &&
                          "day" in period.date
                            ? period.date.day
                            : "Monday"
                        }
                        onValueChange={(value) => {
                          if (
                            period.date.type === "recurring" &&
                            "day" in period.date
                          ) {
                            const newPeriod = { ...period };
                            (newPeriod.date as any).day = value;

                            updateComponent({
                              ...component,
                              periods: [newPeriod],
                            });
                          }
                        }}
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
                          <SelectItem value="weekend-day">
                            Weekend day
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </>
          )}

          {frequency === "yearly" && (
            <>
              <div className="space-y-2">
                <Label>Every</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="1"
                    value={
                      period.date.type === "recurring" && "every" in period.date
                        ? period.date.every
                        : 1
                    }
                    onChange={(e) => {
                      if (period.date.type === "recurring") {
                        const newPeriod = { ...period };
                        (newPeriod.date as any).every =
                          Number.parseInt(e.target.value) || 1;

                        updateComponent({
                          ...component,
                          periods: [newPeriod],
                        });
                      }
                    }}
                    className="w-20"
                  />
                  <span>year(s)</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>In</Label>
                <div className="grid grid-cols-4 gap-2">
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
                    <Button
                      key={month}
                      variant="outline"
                      className={`${
                        period.date.type === "recurring" &&
                        "months" in period.date &&
                        period.date.months.includes(month)
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }`}
                      onClick={() => {
                        if (period.date.type === "recurring") {
                          const newPeriod = { ...period };
                          if (!("months" in newPeriod.date)) {
                            (newPeriod.date as any).months = [];
                          }

                          const months = [...(newPeriod.date as any).months];
                          if (months.includes(month)) {
                            (newPeriod.date as any).months = months.filter(
                              (m) => m !== month
                            );
                          } else {
                            (newPeriod.date as any).months = [...months, month];
                          }

                          updateComponent({
                            ...component,
                            periods: [newPeriod],
                          });
                        }
                      }}
                    >
                      {month.substring(0, 3)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>On the</Label>
                <RadioGroup
                  value={
                    period.date.type === "recurring" && "each" in period.date
                      ? "day"
                      : "weekday"
                  }
                  onValueChange={(value) => {
                    if (period.date.type === "recurring") {
                      const newPeriod = { ...period };
                      if (value === "day") {
                        delete (newPeriod.date as any).day;
                        delete (newPeriod.date as any).on;
                        (newPeriod.date as any).each = 1;
                      } else {
                        delete (newPeriod.date as any).each;
                        (newPeriod.date as any).day = "Monday";
                        (newPeriod.date as any).on = "first";
                      }

                      updateComponent({
                        ...component,
                        periods: [newPeriod],
                      });
                    }
                  }}
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="day" id="day-of-month" />
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min="1"
                        max="31"
                        disabled={
                          !(
                            period.date.type === "recurring" &&
                            "each" in period.date
                          )
                        }
                        value={
                          period.date.type === "recurring" &&
                          "each" in period.date
                            ? period.date.each
                            : 1
                        }
                        onChange={(e) => {
                          if (
                            period.date.type === "recurring" &&
                            "each" in period.date
                          ) {
                            const newPeriod = { ...period };
                            (newPeriod.date as any).each =
                              Number.parseInt(e.target.value) || 1;

                            updateComponent({
                              ...component,
                              periods: [newPeriod],
                            });
                          }
                        }}
                        className="w-20"
                      />
                      <Label htmlFor="day-of-month">day of the month</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
