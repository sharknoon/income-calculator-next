"use client";

import { useEffect, useState } from "react";
import { useComponents } from "@/context/components-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Calculation, Input } from "@/types/income";
import { Play } from "lucide-react";
import { FormulaTestPanel } from "@/components/formula-test-panel";
import Editor, { type Monaco } from "@monaco-editor/react";

interface CalculationEditorProps {
  componentId: string;
  calculation: Calculation;
  onCalculationChange: (calculation: Calculation) => void;
}

export function CalculationEditor({
  componentId,
  calculation,
  onCalculationChange,
}: CalculationEditorProps) {
  const { components } = useComponents();
  const availableDependencies = components.filter((c) => c.id !== componentId);
  const [calculationFunc, setCalculationFunc] = useState(
    calculation.func || "",
  );
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [monaco, setMonaco] = useState<Monaco | null>(null);

  useEffect(() => {
    if (monaco) {
      // Ignore the error "return can only occur within functions"
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        diagnosticCodesToIgnore: [1108],
      });

      function formatInputType(input: Input): string {
        const lines = [`/**`, ` * ${input.name}`];
        if (input.description) {
          lines.push(` * @description ${input.description}`);
        }
        lines.push(` */`);
        let jsType;
        switch (input.type) {
          case "number":
            jsType = "number";
            break;
          case "boolean":
            jsType = "boolean";
            break;
          case "text":
            jsType = "string";
            break;
          case "select":
            jsType = input.options.map((o) => `"${o.id}"`).join(" | ");
            break;
          case "range":
            jsType = "number";
            break;
        }
        lines.push(`"${input.id}": ${jsType};`);
        const types = lines.join("\n");
        console.log(types);
        return types;
      }

      // extra libraries
      const libSource = [
        "interface Inputs {",
        ...calculation.inputs.map(formatInputType),
        "}",
        "declare const inputs: Inputs;",
      ].join("\n");

      const libUri = "ts:filename/inputs.d.ts";
      const libUriParsed = monaco.Uri.parse(libUri);
      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        libSource,
        libUri,
      );
      // When resolving definitions and references, the editor will try to use created models.
      // Creating a model for the library allows "peek definition/references" commands to work with the library.
      monaco.editor.getModel(libUriParsed)?.dispose();
      console.log("setting types");
      monaco.editor.createModel(libSource, "typescript", libUriParsed);
    }
  }, [monaco, calculation]);

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
      (id) => id !== dependencyId,
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
        <Editor
          height="10rem"
          defaultLanguage="typescript"
          onChange={(value) => setCalculationFunc(value || "")}
          className="border"
          onMount={(_, monaco) => setMonaco(monaco)}
          defaultValue={calculation.func}
        />

        <p className="text-xs text-muted-foreground">
          Use JavaScript to create your calculation formula. Access
          input/dependency values using the their ID, e.g.,{" "}
          <code>return inputs.hourlyRate * inputs.hoursWorked</code>
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

          {availableDependencies.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No other components available
            </p>
          ) : (
            <div className="space-y-2">
              {availableDependencies.map(({ id, name }) => (
                <div key={id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`dep-${id}`}
                    checked={calculation.dependencies.includes(id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleAddDependency(id);
                      } else {
                        handleRemoveDependency(id);
                      }
                    }}
                  />
                  <Label htmlFor={`dep-${id}`}>{name}</Label>
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
