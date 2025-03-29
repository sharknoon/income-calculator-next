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
import {
  getMonthName,
  getReactDayPickerLocale,
  getWeekdayName,
} from "@/i18n/utils";
import { useLocale, useTranslations } from "next-intl";

interface PeriodEditorProps {
  period: Period;
  onPeriodChange: (period: Period) => void;
}

export function PeriodEditor({ period, onPeriodChange }: PeriodEditorProps) {
  const [isStartDateCalendarOpen, setIsStartDateCalendarOpen] = useState(false);
  const [isEndDateCalendarOpen, setIsEndDateCalendarOpen] = useState(false);
  const t = useTranslations("PeriodEditor");
  const locale = useLocale();

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

  const getPeriodUnit = (period: Period): string => {
    let unit = "";
    switch (period.frequency) {
      case "daily":
        unit = t("every-days", {
          count: period.every,
        });
        break;
      case "weekly":
        unit = t("every-weeks", {
          count: period.every,
        });
        break;
      case "monthly":
        unit = t("every-months", {
          count: period.every,
        });
        break;
      case "yearly":
        unit = t("every-years", {
          count: period.every,
        });
        break;
    }
    return unit;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("start-date")}</Label>
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
                {period.startDate.toLocaleString(locale)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                timeZone="UTC"
                mode="single"
                locale={getReactDayPickerLocale(locale)}
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
          <Label>{t("end-date")}</Label>
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
                    period.endDate.toLocaleString(locale)
                  ) : (
                    <span>{t("no-end-date")}</span>
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
                locale={getReactDayPickerLocale(locale)}
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
        <Label>{t("frequency")}</Label>
        <Select value={period.frequency} onValueChange={handleFrequencyChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">{t("frequency-daily")}</SelectItem>
            <SelectItem value="weekly">{t("frequency-weekly")}</SelectItem>
            <SelectItem value="monthly">{t("frequency-monthly")}</SelectItem>
            <SelectItem value="yearly">{t("frequency-yearly")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="every">{t("every")}</Label>
        <div className="flex items-center gap-2">
          {t.rich("every-order", {
            input: () => (
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
            ),
            unit: getPeriodUnit(period),
          })}
        </div>
      </div>

      {period.frequency === "weekly" && (
        <div className="space-y-2">
          <Label>{t("weekly-repeat-on")}</Label>
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
            ).map((day, index) => (
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
                  {getWeekdayName(index + 1, locale)}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {period.frequency === "monthly" && (
        <div className="space-y-4">
          <MonthPosition
            period={period}
            onPeriodChange={onPeriodChange}
            handleDayOfMonthTypeChange={handleDayOfMonthTypeChange}
          />
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
              ).map((month, index) => (
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
                    {getMonthName(index + 1, locale)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <MonthPosition
            period={period}
            onPeriodChange={onPeriodChange}
            handleDayOfMonthTypeChange={handleDayOfMonthTypeChange}
          />
        </div>
      )}
    </div>
  );
}

function MonthPosition({
  period,
  onPeriodChange,
  handleDayOfMonthTypeChange,
}: {
  period: Period;
  onPeriodChange: (period: Period) => void;
  handleDayOfMonthTypeChange: (value: Monthly["dayOfMonthType"]) => void;
}) {
  const t = useTranslations("PeriodEditor");
  const locale = useLocale();

  if (period.frequency !== "monthly" && period.frequency !== "yearly") {
    return null;
  }

  return (
    <RadioGroup
      value={period.dayOfMonthType}
      onValueChange={handleDayOfMonthTypeChange}
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="day" id="yearly-day" />
        <div className="flex items-center gap-2">
          {t.rich("day-of-month-day", {
            input: () => (
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
            ),
          })}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <RadioGroupItem value="position" id="yearly-position" />
        <div className="flex items-center gap-2">
          {t.rich("day-of-month-position", {
            position: () => (
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
                  <SelectItem value="first">
                    {t("day-of-month-position-first")}
                  </SelectItem>
                  <SelectItem value="second">
                    {t("day-of-month-position-second")}
                  </SelectItem>
                  <SelectItem value="third">
                    {t("day-of-month-position-third")}
                  </SelectItem>
                  <SelectItem value="fourth">
                    {t("day-of-month-position-fourth")}
                  </SelectItem>
                  <SelectItem value="fifth">
                    {t("day-of-month-position-fifth")}
                  </SelectItem>
                  <SelectItem value="next-to-last">
                    {t("day-of-month-position-next-to-last")}
                  </SelectItem>
                  <SelectItem value="last">
                    {t("day-of-month-position-last")}
                  </SelectItem>
                </SelectContent>
              </Select>
            ),
            day: () => (
              <Select
                value={
                  period.dayOfMonthType === "position" ? period.day : "weekday"
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
                  <SelectItem value="monday">
                    {getWeekdayName(1, locale)}
                  </SelectItem>
                  <SelectItem value="tuesday">
                    {getWeekdayName(2, locale)}
                  </SelectItem>
                  <SelectItem value="wednesday">
                    {getWeekdayName(3, locale)}
                  </SelectItem>
                  <SelectItem value="thursday">
                    {getWeekdayName(4, locale)}
                  </SelectItem>
                  <SelectItem value="friday">
                    {getWeekdayName(5, locale)}
                  </SelectItem>
                  <SelectItem value="saturday">
                    {getWeekdayName(6, locale)}
                  </SelectItem>
                  <SelectItem value="sunday">
                    {getWeekdayName(7, locale)}
                  </SelectItem>
                  <SelectItem value="day">
                    {t("day-of-month-position-day")}
                  </SelectItem>
                  <SelectItem value="weekday">
                    {t("day-of-month-position-weekday")}
                  </SelectItem>
                  <SelectItem value="weekend-day">
                    {t("day-of-month-position-weekend-day")}
                  </SelectItem>
                </SelectContent>
              </Select>
            ),
          })}
        </div>
      </div>
    </RadioGroup>
  );
}
