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
import type { Calculation, InputValue } from "@/lib/types";
import { ComponentInput } from "@/components/component-input";
import { useTranslations } from "next-intl";

interface FormulaTestPanelProps {
  calculation: Calculation;
}

export function FormulaTestPanel({ calculation }: FormulaTestPanelProps) {
  const [inputValues, setInputValues] = useState<Record<string, InputValue>>(
    calculation.inputs.reduce(
      (acc, input) => {
        if (input.defaultValue !== undefined) {
          acc[input.id] = input.defaultValue;
        }
        return acc;
      },
      {} as Record<string, InputValue>,
    ),
  );
  const [dependencyValues, setDependencyValues] = useState<
    Record<string, number>
  >({});
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("FormulaTestPanel");

  // Reset values when calculation changes
  useEffect(() => {
    setInputValues(
      calculation.inputs.reduce(
        (acc, input) => {
          if (input.defaultValue !== undefined) {
            acc[input.id] = input.defaultValue;
          }
          return acc;
        },
        {} as Record<string, InputValue>,
      ),
    );
    setDependencyValues({});
    setResult(null);
    setError(null);
  }, [calculation]);

  const handleInputChange = (inputId: string, value: InputValue) => {
    setInputValues((prev) => ({
      ...prev,
      [inputId]: value,
    }));
  };

  const handleDependencyChange = (depId: string, value: number) => {
    setDependencyValues((prev) => ({
      ...prev,
      [depId]: value,
    }));
  };

  const executeFormula = async () => {
    try {
      const calc = new Function("inputs", "dependencies", calculation.func);
      const result = calc(inputValues ?? {}, dependencyValues ?? {});

      setResult(String(result));
      setError(null);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="mr-2 size-5" />
          {t("title")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Input values section */}
          {calculation.inputs.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">{t("input-values")}</h3>
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
                      onChange={(value) => handleInputChange(input.id, value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dependency values section */}
          {calculation.dependencies.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">{t("dependency-values")}</h3>
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
                      value={dependencyValues[depId] || 0}
                      onChange={(e) =>
                        handleDependencyChange(
                          depId,
                          Number.parseFloat(e.target.value) || 0,
                        )
                      }
                      placeholder={t("dependency-value-placeholder")}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Execute button and result */}
          <div className="space-y-4">
            <Button onClick={executeFormula} className="w-full">
              <Calculator className="mr-2 size-4" />
              {t("button-calculate-result")}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>{t("error")}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result !== null && !error && (
              <div className="p-4 border rounded-md">
                <div className="text-sm font-medium mb-1">{t("result")}</div>
                <div className="text-xl font-bold">{result}</div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
