"use client";

import { useEffect, useState } from "react";
import { useComponents } from "@/context/components-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Calculation, Input } from "@/lib/types";
import { Play } from "lucide-react";
import { FormulaTestPanel } from "@/components/formula-test-panel";
import Editor, { type Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

interface CalculationEditorProps {
  componentId: string;
  periodId: string;
  calculation: Calculation;
  onCalculationChange: (calculation: Calculation) => void;
}

export function CalculationEditor({
  componentId,
  periodId,
  calculation,
  onCalculationChange,
}: CalculationEditorProps) {
  const { components } = useComponents();
  const availableDependencies = components.filter((c) => c.id !== componentId);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [editor, setEditor] = useState<editor.IStandaloneCodeEditor | null>(
    null,
  );
  const [monaco, setMonaco] = useState<Monaco | null>(null);
  const [oldPeriodId, setOldPeriodId] = useState(periodId);
  const { resolvedTheme } = useTheme();
  const t = useTranslations("CalculationEditor");

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
        return lines.join("\n");
      }

      function formatDependencyType(dependencyId: string): string {
        const lines = [`/**`, ` * ${dependencyId}`];
        lines.push(` */`);
        lines.push(`"${dependencyId}": number;`);
        return lines.join("\n");
      }

      const inputsSource = [
        "interface Inputs {",
        ...calculation.inputs.map(formatInputType),
        "}",
        "declare const inputs: Inputs;",
      ].join("\n");

      const inputsUri = "ts:filename/inputs.d.ts";
      const inputsUriParsed = monaco.Uri.parse(inputsUri);

      const dependenciesSource = [
        "interface Dependencies {",
        ...calculation.dependencies.map(formatDependencyType),
        "}",
        "declare const dependencies: Dependencies;",
      ].join("\n");
      const dependenciesUri = "ts:filename/dependencies.d.ts";
      const dependenciesUriParsed = monaco.Uri.parse(dependenciesUri);

      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        inputsSource,
        inputsUri,
      );
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        dependenciesSource,
        dependenciesUri,
      );

      // When resolving definitions and references, the editor will try to use created models.
      // Creating a model for the library allows "peek definition/references" commands to work with the library.
      monaco.editor.getModel(inputsUriParsed)?.dispose();
      monaco.editor.createModel(inputsSource, "typescript", inputsUriParsed);

      monaco.editor.getModel(dependenciesUriParsed)?.dispose();
      monaco.editor.createModel(
        dependenciesSource,
        "typescript",
        dependenciesUriParsed,
      );
    }
  }, [monaco, calculation]);

  // Only change the value of the editor when the period tabs change
  // This is to avoid the editor to reset the cursor when the user is typing
  useEffect(() => {
    if (editor && periodId !== oldPeriodId) {
      setOldPeriodId(periodId);
      editor.setValue(calculation.func);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodId, editor]);

  useEffect(() => {
    if (editor) {
      editor.updateOptions({
        theme: resolvedTheme === "dark" ? "vs-dark" : "vs",
      });
    }
  }, [resolvedTheme, editor]);

  useEffect(() => {
    if (editor) {
      editor.updateOptions({
        automaticLayout: true,
      });
    }
  }, [editor]);

  const handleChangeCalculationFunc = (calculationFunc: string) => {
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
          <Label htmlFor="calculation">{t("calculation-formula")}</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTestPanel(!showTestPanel)}
          >
            <Play className="mr-2 size-4" />
            {showTestPanel
              ? t("button-hide-test-panel")
              : t("button-test-formula")}
          </Button>
        </div>
        <Editor
          height="35rem"
          language="typescript"
          onChange={(value) => handleChangeCalculationFunc(value || "")}
          className="border"
          onMount={(editor, monaco) => {
            setEditor(editor);
            setMonaco(monaco);
          }}
          defaultValue={calculation.func}
        />

        <p className="text-xs text-muted-foreground">
          {t.rich("editor-description", {
            br: () => <br />,
            examples: (chunks) => (
              <span className="font-semibold">{chunks}</span>
            ),
            code: (chunks) => <code>{chunks}</code>,
          })}
        </p>
      </div>

      {showTestPanel && <FormulaTestPanel calculation={calculation} />}

      <div className="space-y-2">
        <Label>{t("dependencies")}</Label>
        <div className="border rounded-md p-4">
          <p className="text-sm mb-2">{t("dependencies-description")}</p>

          {availableDependencies.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("no-components-available")}
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
              <p className="text-sm mb-2">{t("dependency-access")}</p>
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
