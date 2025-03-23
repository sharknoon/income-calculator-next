"use client";

import { Label } from "@/components/ui/label";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Input as InputType } from "@/types/income";

interface ComponentInputsProps {
  inputs: Array<InputType>;
  onInputChange: (inputId: string, value: any) => void;
}

export function ComponentInputs({ inputs }: ComponentInputsProps) {
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

  if (!period || period.inputs.length === 0) {
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

  const renderInput = (input: InputType) => {
    switch (input.type) {
      case "text":
        return (
          <Input
            id={input.id}
            value={inputValues[input.id] || input.defaultValue || ""}
            onChange={(e) => handleInputChange(input.id, e.target.value)}
            placeholder={input.placeholder || ""}
            minLength={input.minLength}
            maxLength={input.maxLength}
            required={input.required !== false}
          />
        );
      case "number":
        return (
          <div className="flex items-center space-x-2">
            <Input
              id={input.id}
              type="number"
              value={inputValues[input.id] || input.defaultValue || ""}
              onChange={(e) =>
                handleInputChange(
                  input.id,
                  Number.parseFloat(e.target.value) || 0
                )
              }
              placeholder={input.placeholder || ""}
              min={input.min}
              max={input.max}
              step={input.step || 1}
              required={input.required !== false}
              className="flex-1"
            />
            {input.unit && (
              <span className="text-muted-foreground">{input.unit}</span>
            )}
          </div>
        );
      case "select":
        return (
          <Select
            value={inputValues[input.id] || input.defaultOption || ""}
            onValueChange={(value) => handleInputChange(input.id, value)}
          >
            <SelectTrigger id={input.id}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {input.options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "range":
        return (
          <div className="space-y-2">
            <Slider
              id={input.id}
              min={input.min}
              max={input.max}
              step={input.step}
              value={[inputValues[input.id] || input.defaultValue]}
              onValueChange={(values) => handleInputChange(input.id, values[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{input.min}</span>
              <span>{inputValues[input.id] || input.defaultValue}</span>
              <span>{input.max}</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Name??</CardTitle>
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
              {renderInput(input)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
