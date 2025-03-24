"use client";

import { useState } from "react";
import { useComponents } from "@/context/components-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Calculation } from "@/types/income";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Play } from "lucide-react";
import { FormulaTestPanel } from "./formula-test-panel";

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
    calculation.func || "return new BigNumber(0)"
  );
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveCalculationFunc = () => {
    try {
      // Basic validation - check if the code contains BigNumber
      if (!calculationFunc.includes("BigNumber")) {
        setError("Formula must use BigNumber.js. Example: new BigNumber(10)");
        return;
      }

      setError(null);
      const newCalculation = { ...calculation };
      newCalculation.func = calculationFunc;

      onCalculationChange(newCalculation);
    } catch (err) {
      setError(
        `Error saving calculation: ${err instanceof Error ? err.message : String(err)}`
      );
    }
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
        <div className="flex justify-between items-center">
          <Label htmlFor="calculation">Calculation Formula</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTestPanel(!showTestPanel)}
          >
            <Play className="mr-2 h-4 w-4" />
            {showTestPanel ? "Hide Test Panel" : "Test Formula"}
          </Button>
        </div>
        <Textarea
          id="calculation"
          value={calculationFunc}
          onChange={(e) => setCalculationFunc(e.target.value)}
          className="font-mono h-40"
          placeholder="return new BigNumber(0)"
        />

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <p className="text-xs text-muted-foreground">
          Use JavaScript with BigNumber.js to create your calculation formula.
          Access input values using the input ID, e.g.,{" "}
          <code>inputs.hourlyRate * inputs.hoursWorked</code>
        </p>

        <Button onClick={handleSaveCalculationFunc}>Save Calculation</Button>
      </div>

      {showTestPanel && <FormulaTestPanel calculation={calculation} />}

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
