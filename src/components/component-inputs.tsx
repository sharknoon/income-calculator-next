"use client";

import { Label } from "@/components/ui/label";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Component } from "@/types/income";
import { Temporal } from "@js-temporal/polyfill";
import { ComponentInput } from "@/components/component-input";

interface ComponentInputsProps {
  component: Component;
  date: Temporal.PlainDate;
}

export function ComponentInputs({ component }: ComponentInputsProps) {
  const inputs =
    component.type === "one-time" ? component.calculation.inputs : [];
  // Initialize input values from localStorage if available
  const [inputValues, setInputValues] = useState<Record<string, any>>({});

  // Load input values from localStorage after component mounts (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedValues = localStorage.getItem(
          `incomeCalculator.inputValues.${component.id}`
        );
        if (savedValues) {
          setInputValues(JSON.parse(savedValues));
        }
      } catch (error) {
        console.error("Failed to load input values from localStorage:", error);
      }
    }
  }, [component.id]);

  // Save input values to localStorage when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          `incomeCalculator.inputValues.${component.id}`,
          JSON.stringify(inputValues)
        );
      } catch (error) {
        console.error("Failed to save input values to localStorage:", error);
      }
    }
  }, [inputValues, component.id]);

  if (inputs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{component.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No inputs required for this component
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleInputChange = (inputId: string, value: any) => {
    setInputValues((prev) => ({
      ...prev,
      [inputId]: value,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{component.name}</CardTitle>
      </CardHeader>
      <CardContent>
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
              <ComponentInput input={input} value={inputValues[input.id]} onChange={handleInputChange} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
