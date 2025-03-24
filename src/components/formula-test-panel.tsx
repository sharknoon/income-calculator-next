"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Calculator } from "lucide-react";
import type { Calculation } from "@/types/income";
import BigNumber from "bignumber.js";
import { ComponentInput } from "@/components/component-input";

interface FormulaTestPanelProps {
  calculation: Calculation;
}

export function FormulaTestPanel({ calculation }: FormulaTestPanelProps) {
  const [inputValues, setInputValues] = useState<Record<string, any>>({});
  const [dependencyValues, setDependencyValues] = useState<Record<string, any>>(
    {}
  );
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset values when calculation changes
  useEffect(() => {
    setInputValues({});
    setDependencyValues({});
    setResult(null);
    setError(null);
  }, [calculation]);

  const handleInputChange = (inputId: string, value: any) => {
    setInputValues((prev) => ({
      ...prev,
      [inputId]: value,
    }));
  };

  const handleDependencyChange = (depId: string, value: any) => {
    setDependencyValues((prev) => ({
      ...prev,
      [depId]: value,
    }));
  };

  const executeFormula = () => {
    try {
      // Create a safe execution context with BigNumber available
      const inputs = { ...inputValues };
      const dependencies = { ...dependencyValues };

      // Create a function that will execute the formula in a controlled context
      const calculateFn = new Function(
        "BigNumber",
        "inputs",
        "dependencies",
        `try { return ${calculation.func}; } catch (e) { throw new Error("Calculation error: " + e.message); }`
      );

      // Execute the function with our controlled inputs
      const calculationResult = calculateFn(BigNumber, inputs, dependencies);

      // Format the result
      if (calculationResult instanceof BigNumber) {
        setResult(calculationResult.toString());
      } else {
        setResult(String(calculationResult));
      }

      setError(null);
    } catch (err) {
      setError(
        `Error executing formula: ${err instanceof Error ? err.message : String(err)}`
      );
      setResult(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="mr-2 h-5 w-5" />
          Formula Test Panel
        </CardTitle>
        <CardDescription>
          Enter test values for your inputs and dependencies to see the formula
          result
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Input values section */}
          {calculation.inputs.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Input Values</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {calculation.inputs.map((input) => (
                  <div key={input.id} className="space-y-2">
                    <Label>
                      {input.name}
                      <span className="ml-1 text-xs text-muted-foreground">
                        (inputs.{input.id})
                      </span>
                    </Label>
                    <ComponentInput
                      input={input}
                      value={inputValues[input.id]}
                      onChange={handleInputChange}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dependency values section */}
          {calculation.dependencies.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Dependency Values</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {calculation.dependencies.map((depId) => (
                  <div key={depId} className="space-y-2">
                    <Label>
                      TODO name of component
                      <span className="ml-1 text-xs text-muted-foreground">
                        (dependencies.{depId})
                      </span>
                    </Label>
                    <Input
                      type="number"
                      value={dependencyValues[depId] || "0"}
                      onChange={(e) =>
                        handleDependencyChange(
                          depId,
                          Number.parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="Enter value"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Execute button and result */}
          <div className="space-y-4">
            <Button onClick={executeFormula} className="w-full">
              <Calculator className="mr-2 h-4 w-4" />
              Calculate Result
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result !== null && !error && (
              <div className="p-4 border rounded-md">
                <div className="text-sm font-medium mb-1">Result:</div>
                <div className="text-xl font-bold">{result}</div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
