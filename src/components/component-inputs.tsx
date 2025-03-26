"use client";

import { Label } from "@/components/ui/label";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Component, InputValue } from "@/types/income";
import { Temporal } from "@js-temporal/polyfill";
import { ComponentInput } from "@/components/component-input";

interface ComponentInputsProps {
  components: Array<Component>;
  date: Temporal.PlainDate;
  onInputValuesChange?: (
    inputValues: Record<string, Record<string, InputValue>>,
  ) => void;
}

export function ComponentsInputs({
  components,
  date,
  onInputValuesChange,
}: ComponentInputsProps) {
  const getInputsForDate = (component: Component, date: Temporal.PlainDate) => {
    if (component.type === "one-time") {
      return component.calculation.inputs;
    } else {
      const period = component.calculationPeriods.find(
        (period) =>
          Temporal.PlainDate.compare(period.period.startDate, date) <= 0 &&
          (!period.period.endDate ||
            Temporal.PlainDate.compare(period.period.endDate, date) >= 0),
      );
      return period?.calculation.inputs ?? [];
    }
  };

  const getInputValues = (components: Array<Component>) => {
    const inputValues: Record<string, Record<string, InputValue>> = {};
    for (const component of components) {
      inputValues[component.id] = {};

      let savedInputValues: Record<string, InputValue> = {};
      if (typeof window !== "undefined") {
        try {
          const savedValues = localStorage.getItem(
            `incomeCalculator.inputValues.${component.id}`,
          );
          if (savedValues) {
            savedInputValues = JSON.parse(savedValues);
          }
        } catch (error) {
          console.error(
            "Failed to load input values from localStorage:",
            error,
          );
        }
      }

      const inputs = getInputsForDate(component, date);

      for (const input of inputs) {
        let valueIfAbsent: InputValue | undefined;
        switch (input.type) {
          case "text":
            valueIfAbsent = "";
            break;
          case "number":
            valueIfAbsent = input.min ?? 0;
            break;
          case "boolean":
            valueIfAbsent = false;
            break;
          case "select":
            valueIfAbsent =
              input.options.length > 0 ? input.options[0].id : undefined;
            break;
          case "range":
            valueIfAbsent = input.min ?? 0;
            break;
          default:
            valueIfAbsent = "";
        }
        inputValues[component.id][input.id] =
          savedInputValues[input.id] ?? input.defaultValue ?? valueIfAbsent;
      }
    }
    return inputValues;
  };

  const [inputValues, setInputValues] = useState<
    Record<string, Record<string, InputValue>>
  >(getInputValues(components));

  /*useEffect(
    () => onInputValuesChange?.(inputValues),
    [onInputValuesChange, inputValues]
  );*/

  const handleInputChange = (
    componentId: string,
    inputId: string,
    value: InputValue,
  ) => {
    setInputValues((prevInputValues) => ({
      ...prevInputValues,
      [componentId]: {
        ...prevInputValues[componentId],
        [inputId]: value,
      },
    }));
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          `incomeCalculator.inputValues.${componentId}`,
          JSON.stringify(inputValues[componentId]),
        );
      } catch (error) {
        console.error("Failed to save input values to localStorage:", error);
      }
    }
  };

  return components.map((component) => {
    const inputs = getInputsForDate(component, date);
    return (
      <Card key={component.id}>
        <CardHeader>
          <CardTitle>{component.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {inputs.length === 0 && (
            <p className="text-muted-foreground">
              No inputs required for this component
            </p>
          )}
          {inputs.length > 0 && (
            <div className="space-y-4">
              {inputs.map((input) => (
                <div key={input.id} className="space-y-2">
                  <Label htmlFor={input.id}>
                    {input.name}
                    {input.required !== false && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </Label>
                  {input.description && (
                    <p className="text-xs text-muted-foreground">
                      {input.description}
                    </p>
                  )}
                  <ComponentInput
                    input={input}
                    value={inputValues[component.id][input.id]}
                    onChange={(value) =>
                      handleInputChange(component.id, input.id, value)
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  });
}
