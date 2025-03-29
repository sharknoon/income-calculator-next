"use client";

import { Label } from "@/components/ui/label";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Component, Input } from "@/lib/types";
import { Temporal } from "@js-temporal/polyfill";
import { ComponentInput } from "@/components/component-input";
import { useInputValues } from "@/context/input-values-context";
import {
  arePeriodsOverlapping,
  earlierPlainDate,
  isDateInPeriod,
  laterPlainDate,
} from "@/lib/calculation";
import { useLocale, useTranslations } from "next-intl";

interface ComponentInputsProps {
  components: Array<Component>;
  startDate: Temporal.PlainDate;
  endDate: Temporal.PlainDate;
}

export function ComponentsInputs({
  components,
  startDate,
  endDate,
}: ComponentInputsProps) {
  const { inputValues, updateInputValue } = useInputValues();
  const t = useTranslations("ComponentsInputs");
  const locale = useLocale();

  type PeriodWithInputs = {
    id: string;
    startDate: Temporal.PlainDate;
    endDate: Temporal.PlainDate;
    inputs: Array<Input>;
  };

  const getMatchingPeriodsWithInputs = (
    component: Component,
    startDate: Temporal.PlainDate,
    endDate: Temporal.PlainDate,
  ): Array<PeriodWithInputs> => {
    const results: Array<PeriodWithInputs> = [];
    if (component.type === "one-time") {
      if (isDateInPeriod(component.date, startDate, endDate)) {
        results.push({
          id: "",
          startDate: component.date,
          endDate: component.date,
          inputs: component.calculation.inputs,
        });
      }
    } else {
      for (const period of component.calculationPeriods) {
        if (arePeriodsOverlapping(period.period, { startDate, endDate })) {
          const newStartDate = laterPlainDate(
            period.period.startDate,
            startDate,
          );
          const newEndDate = period.period.endDate
            ? earlierPlainDate(period.period.endDate, endDate)
            : endDate;
          results.push({
            id: period.id,
            startDate: newStartDate,
            endDate: newEndDate,
            inputs: period.calculation.inputs,
          });
        }
      }
    }
    return results;
  };

  const formatDate = (date: Temporal.PlainDate) => {
    return date.toLocaleString(locale);
  };

  return components.map((component) => {
    const periods = getMatchingPeriodsWithInputs(component, startDate, endDate);
    return (
      <Card key={component.id}>
        <CardHeader>
          <CardTitle>{component.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {(periods.length === 0 ||
            periods.every((p) => p.inputs.length === 0)) && (
            <p className="text-muted-foreground">{t("no-inputs-required")}</p>
          )}
          {periods.length > 0 && (
            <div className="space-y-4">
              {periods.map((period, index) => {
                return period.inputs.map((input) => (
                  <div key={index} className="space-y-2">
                    <Label>
                      {input.name}
                      {input.required !== false && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                      {periods.length > 1 && (
                        <span className="text-muted-foreground ml-1">
                          {t("input-range", {
                            startDate: formatDate(period.startDate),
                            endDate: formatDate(period.endDate),
                          })}
                        </span>
                      )}
                    </Label>
                    {component.description && (
                      <p className="text-xs text-muted-foreground">
                        {input.description}
                      </p>
                    )}
                    <ComponentInput
                      input={input}
                      value={inputValues[component.id]?.[period.id]?.[input.id]}
                      onChange={(value) =>
                        updateInputValue(
                          component.id,
                          period.id,
                          input.id,
                          value,
                        )
                      }
                    />
                  </div>
                ));
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  });
}
