"use client";

import { useState } from "react";
import { useComponents } from "@/context/components-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Calculation } from "@/types/income";

interface CalculationEditorProps {
  calculation: Calculation;
  onCalculationChange: (calculation: Calculation) => void;
}

export function CalculationEditor({
  calculation,
  onCalculationChange,
}: CalculationEditorProps) {
  const { components } = useComponents();
  const [calculationFunc, setCalculationFunc] = useState(
    calculation.func || "new BigNumber(0)"
  );

  const handleSaveCalculationFunc = () => {
    const newCalculation = { ...calculation };
    newCalculation.func = calculationFunc;

    onCalculationChange(newCalculation);
  };

  const handleAddDependency = (dependencyId: string) => {
    const newCalculation = { ...calculation };
    if (!newCalculation.dependencies.includes(dependencyId)) {
      newCalculation.dependencies = [
        ...newCalculation.dependencies,
        dependencyId,
      ];
    }

    onCalculationChange(newCalculation);
  };

  const handleRemoveDependency = (dependencyId: string) => {
    const newCalculation = { ...calculation };
    newCalculation.dependencies = newCalculation.dependencies.filter(
      (id) => id !== dependencyId
    );

    onCalculationChange(newCalculation);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="calculation">Calculation Formula</Label>
        <Textarea
          id="calculation"
          value={calculationFunc}
          onChange={(e) => setCalculationFunc(e.target.value)}
          className="font-mono h-40"
          placeholder="new BigNumber(0)"
        />
        <p className="text-xs text-muted-foreground">
          Use JavaScript with BigNumber.js to create your calculation formula.
          Access input values using the input ID, e.g.,{" "}
          <code>inputs.hourlyRate * inputs.hoursWorked</code>
        </p>
        <Button onClick={handleSaveCalculationFunc}>Save Calculation</Button>
      </div>

      <div className="space-y-2">
        <Label>Dependencies</Label>
        <div className="border rounded-md p-4">
          <p className="text-sm mb-2">
            Select other components that this calculation depends on:
          </p>

          {calculation.dependencies.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No other components available
            </p>
          ) : (
            <div className="space-y-2">
              {calculation.dependencies.map((depId) => (
                <div key={depId} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`dep-${depId}`}
                    checked={calculation.dependencies.includes(depId)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleAddDependency(depId);
                      } else {
                        handleRemoveDependency(depId);
                      }
                    }}
                  />
                  <Label htmlFor={`dep-${depId}`}>
                    {components.find((c) => c.id === depId)?.name ||
                      "Unknown Component"}
                  </Label>
                </div>
              ))}
            </div>
          )}

          {calculation.dependencies.length > 0 && (
            <div className="mt-4">
              <p className="text-sm mb-2">
                Access dependency values in your calculation using:
              </p>
              <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                {calculation.dependencies.map((depId) => {
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
