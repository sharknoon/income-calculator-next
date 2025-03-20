"use client";

import { useState } from "react";
import { useComponents } from "@/context/components-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Component } from "@/types/income";

interface CalculationEditorProps {
  component: Component;
}

export function CalculationEditor({ component }: CalculationEditorProps) {
  const { updateComponent, components } = useComponents();
  const period = component.periods[0];
  const [calculationCode, setCalculationCode] = useState(
    period?.calculate || "new BigNumber(0)",
  );

  const handleSaveCalculation = () => {
    if (!period) return;

    const newPeriod = { ...period };
    newPeriod.calculate = calculationCode;

    updateComponent({
      ...component,
      periods: [newPeriod],
    });
  };

  const getAvailableDependencies = () => {
    return components.filter((c) => c.id !== component.id);
  };

  const handleAddDependency = (dependencyId: string) => {
    if (!period) return;

    const newPeriod = { ...period };
    if (!newPeriod.dependencies.includes(dependencyId)) {
      newPeriod.dependencies = [...newPeriod.dependencies, dependencyId];
    }

    updateComponent({
      ...component,
      periods: [newPeriod],
    });
  };

  const handleRemoveDependency = (dependencyId: string) => {
    if (!period) return;

    const newPeriod = { ...period };
    newPeriod.dependencies = newPeriod.dependencies.filter(
      (id) => id !== dependencyId,
    );

    updateComponent({
      ...component,
      periods: [newPeriod],
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="calculation">Calculation Formula</Label>
        <Textarea
          id="calculation"
          value={calculationCode}
          onChange={(e) => setCalculationCode(e.target.value)}
          className="font-mono h-40"
          placeholder="new BigNumber(0)"
        />
        <p className="text-xs text-muted-foreground">
          Use JavaScript with BigNumber.js to create your calculation formula.
          Access input values using the input ID, e.g.,{" "}
          <code>inputs.hourlyRate * inputs.hoursWorked</code>
        </p>
        <Button onClick={handleSaveCalculation}>Save Calculation</Button>
      </div>

      <div className="space-y-2">
        <Label>Dependencies</Label>
        <div className="border rounded-md p-4">
          <p className="text-sm mb-2">
            Select other components that this calculation depends on:
          </p>

          {getAvailableDependencies().length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No other components available
            </p>
          ) : (
            <div className="space-y-2">
              {getAvailableDependencies().map((dep) => (
                <div key={dep.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`dep-${dep.id}`}
                    checked={period?.dependencies.includes(dep.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleAddDependency(dep.id);
                      } else {
                        handleRemoveDependency(dep.id);
                      }
                    }}
                  />
                  <Label htmlFor={`dep-${dep.id}`}>{dep.name}</Label>
                </div>
              ))}
            </div>
          )}

          {period?.dependencies.length > 0 && (
            <div className="mt-4">
              <p className="text-sm mb-2">
                Access dependency values in your calculation using:
              </p>
              <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                {period.dependencies.map((depId) => {
                  const dep = components.find((c) => c.id === depId);
                  return dep ? `dependencies.${dep.id}\n` : "";
                })}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
