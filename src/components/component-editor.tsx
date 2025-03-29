"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Plus, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PeriodEditor } from "@/components/period-editor";
import { InputsEditor } from "@/components/inputs-editor";
import { CalculationEditor } from "@/components/calculation-editor";
import { Temporal } from "@js-temporal/polyfill";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Calculation,
  CalculationPeriod,
  Component,
  Input as InputType,
  Period,
  RecurringComponent,
} from "@/lib/types";
import { DateEditor } from "@/components/date-editor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLocale, useTranslations } from "next-intl";

interface ComponentEditorProps {
  component: Component;
  onComponentChange: (oldID: string, component: Component) => void;
}

export default function ComponentEditor({
  component: c,
  onComponentChange,
}: ComponentEditorProps) {
  const oldID = c.id;
  const [component, setComponent] = useState(c);
  const router = useRouter();
  const [editorTab, setEditorTab] = useState("details");
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | undefined>(
    c.type === "recurring" ? c.calculationPeriods[0].id : undefined,
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const t = useTranslations("ComponentEditor");
  const locale = useLocale();

  useEffect(() => {
    const hasChanges = JSON.stringify(c) !== JSON.stringify(component);
    setHasUnsavedChanges(hasChanges);
  }, [c, component]);

  if (!component) {
    return null;
  }

  const handleIDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newID = e.target.value;
    // remove invalid characters
    newID = newID.replace(/[^a-z0-9_\$]/g, "");
    // ensure it starts with a letter
    newID = newID.replace(/^[^a-z_\$]/, "i");
    const updatedComponent = {
      ...component,
      id: newID,
    };

    setComponent(updatedComponent);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedComponent = {
      ...component,
      name: e.target.value,
    };

    setComponent(updatedComponent);
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const updatedComponent = {
      ...component,
      description: e.target.value,
    };

    setComponent(updatedComponent);
  };

  const handleTypeChange = (type: Component["type"]) => {
    let updatedComponent: Component;
    if (type === "one-time") {
      updatedComponent = {
        id: component.id,
        name: component.name,
        type: "one-time",
        date: Temporal.Now.plainDateISO(),
        calculation: {
          dependencies: [],
          inputs: [],
          func: "return 0;",
        },
      };
    } else {
      updatedComponent = {
        id: component.id,
        name: component.name,
        type: "recurring",
        calculationPeriods: [
          {
            id: crypto.randomUUID(),
            period: {
              startDate: Temporal.Now.plainDateISO().with({ day: 1 }),
              frequency: "monthly",
              every: 1,
              dayOfMonthType: "day",
              each: 1,
            },
            calculation: {
              dependencies: [],
              inputs: [],
              func: "return 0;",
            },
          },
        ],
      };
    }

    setComponent(updatedComponent);
  };

  const handleRecurringPeriodChange = (period: Period) => {
    if (component.type !== "recurring") {
      return;
    }

    const updatedComponent = {
      ...component,
      calculationPeriods: component.calculationPeriods.map((p) =>
        p.id === selectedPeriodId ? { ...p, period: period } : p,
      ),
    };

    setComponent(updatedComponent);
  };

  const handleOneTimeDateChange = (date: Temporal.PlainDate) => {
    if (component.type !== "one-time") {
      return;
    }

    const updatedComponent = {
      ...component,
      date: date,
    };

    setComponent(updatedComponent);
  };

  const handleInputChange = (inputs: Array<InputType>) => {
    let updatedComponent: Component;
    if (component.type === "one-time") {
      updatedComponent = {
        ...component,
        calculation: {
          ...component.calculation,
          inputs: inputs,
        },
      };
    } else {
      updatedComponent = {
        ...component,
        calculationPeriods: component.calculationPeriods.map((p) =>
          p.id === selectedPeriodId
            ? { ...p, calculation: { ...p.calculation, inputs: inputs } }
            : p,
        ),
      };
    }

    setComponent(updatedComponent);
  };

  const handleCalculationChange = (calculation: Calculation) => {
    let updatedComponent: Component;
    if (component.type === "one-time") {
      updatedComponent = {
        ...component,
        calculation: calculation,
      };
    } else {
      updatedComponent = {
        ...component,
        calculationPeriods: component.calculationPeriods.map((p) =>
          p.id === selectedPeriodId ? { ...p, calculation: calculation } : p,
        ),
      };
    }

    setComponent(updatedComponent);
  };

  const addNewCalculationPeriod = () => {
    if (component.type !== "recurring") {
      return;
    }

    const newCalculationPeriod: CalculationPeriod = {
      id: crypto.randomUUID(),
      period: {
        startDate: Temporal.Now.plainDateISO().with({ day: 1 }),
        frequency: "monthly",
        every: 1,
        dayOfMonthType: "position",
        on: "last",
        day: "weekday",
      },
      calculation: {
        dependencies: [],
        inputs: [],
        func: "return 0;",
      },
    };

    const updatedComponent: RecurringComponent = {
      ...component,
      calculationPeriods: [
        ...component.calculationPeriods,
        newCalculationPeriod,
      ],
    };

    setComponent(updatedComponent);
    setSelectedPeriodId(newCalculationPeriod.id);
  };

  const removeCalculationPeriod = (id: string) => {
    if (component.type !== "recurring") {
      return;
    }

    if (component.calculationPeriods.length <= 1) {
      return; // Don't remove the last period
    }

    const updatedCalculationPeriods = component.calculationPeriods.filter(
      (period) => period.id !== id,
    );

    const updatedComponent: RecurringComponent = {
      ...component,
      calculationPeriods: updatedCalculationPeriods,
    };

    setComponent(updatedComponent);
    const lastPeriod =
      updatedCalculationPeriods[updatedCalculationPeriods.length - 1];
    setSelectedPeriodId(lastPeriod.id);
  };

  const duplicateCalculationPeriod = (id: string) => {
    if (component.type !== "recurring") {
      return;
    }

    const periodToDuplicate = component.calculationPeriods.find(
      (period) => period.id === id,
    );
    if (!periodToDuplicate) {
      return;
    }

    const duplicatedPeriod: CalculationPeriod = {
      ...JSON.parse(JSON.stringify(periodToDuplicate), (key, value) => {
        // Reconstruct the date object
        if ((key === "startDate" || key === "endDate") && value) {
          return Temporal.PlainDate.from(value);
        }
        return value;
      }),
      id: crypto.randomUUID(),
    };
    const updatedComponent: RecurringComponent = {
      ...component,
      calculationPeriods: [...component.calculationPeriods, duplicatedPeriod],
    };

    setComponent(updatedComponent);
    setSelectedPeriodId(duplicatedPeriod.id);
  };

  const handleSave = () => {
    onComponentChange(oldID, component);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {hasUnsavedChanges && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon">
                <ArrowLeft className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t("alert-dialog-unsaved-changes-title")}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t("alert-dialog-unsaved-changes-description")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {t("alert-dialog-unsaved-changes-cancel")}
                </AlertDialogCancel>
                <Button variant="destructive" onClick={() => router.push("/")}>
                  {t("alert-dialog-unsaved-changes-discard")}
                </Button>
                <AlertDialogAction
                  onClick={() => {
                    handleSave();
                    router.push("/");
                  }}
                >
                  {t("alert-dialog-unsaved-changes-save")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {!hasUnsavedChanges && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="size-4" />
          </Button>
        )}
        <h2 className="text-2xl font-bold">{t("title")}</h2>
      </div>

      <Card>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="id">{t("input-id")}</Label>
              <Input
                id="id"
                value={component.id || ""}
                onChange={handleIDChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="name">{t("input-name")}</Label>
              <Input
                id="name"
                value={component.name || ""}
                onChange={handleNameChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">{t("input-description")}</Label>
              <Textarea
                id="description"
                value={component.description || ""}
                onChange={handleDescriptionChange}
                placeholder={t("input-description-placeholder")}
                className="mt-1"
              />
            </div>

            <div className="space-y-2">
              <Label>{t("component-type")}</Label>
              <RadioGroup
                value={component.type}
                onValueChange={handleTypeChange}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="one-time" id="one-time" />
                  <Label htmlFor="one-time" className="cursor-pointer">
                    {t("component-type-one-time")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="recurring" id="recurring" />
                  <Label htmlFor="recurring" className="cursor-pointer">
                    {t("component-type-recurring")}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {component.type === "recurring" && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>{t("periods")}</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addNewCalculationPeriod}
                  >
                    <Plus className="size-4 mr-1" /> {t("button-add-period")}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {component.calculationPeriods
                    .sort((a, b) =>
                      Temporal.PlainDate.compare(
                        a.period.startDate,
                        b.period.startDate,
                      ),
                    )
                    .map((period, index) => (
                      <div
                        key={period.id}
                        className={`
                      group transition-colors px-3 py-1 rounded-md cursor-pointer flex items-center gap-2
                      ${
                        selectedPeriodId === period.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }
                    `}
                        onClick={() => setSelectedPeriodId(period.id)}
                      >
                        <span>
                          {t("badge-period", {
                            period: index + 1,
                            startDate:
                              period.period.startDate.toLocaleString(locale),
                            endDate:
                              period.period.endDate?.toLocaleString(locale) ||
                              t("badge-period-indefinite"),
                          })}
                        </span>
                        <div className="relative">
                          <button
                            className={`p-2 absolute opacity-0 group-hover:opacity-100 transition left-0 top-1/2 -translate-x-full -translate-y-1/2 ${
                              selectedPeriodId === period.id
                                ? "bg-primary text-primary-foreground hover:text-blue-400"
                                : "bg-muted hover:text-blue-700"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateCalculationPeriod(period.id);
                            }}
                          >
                            <Copy className="size-3" />
                          </button>
                          {component.calculationPeriods.length > 1 && (
                            <button
                              className="hover:text-destructive transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeCalculationPeriod(period.id);
                              }}
                            >
                              <X className="size-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <Tabs
              value={editorTab}
              onValueChange={setEditorTab}
              className="w-full mt-6"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">
                  {component.type === "one-time"
                    ? t("tab-date")
                    : t("tab-period")}
                </TabsTrigger>
                <TabsTrigger value="inputs">{t("tab-inputs")}</TabsTrigger>
                <TabsTrigger value="calculation">
                  {t("tab-calculation")}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="pt-4">
                {component.type === "recurring" && (
                  <PeriodEditor
                    period={
                      component.calculationPeriods.find(
                        (p) => p.id === selectedPeriodId,
                      )!.period
                    }
                    onPeriodChange={handleRecurringPeriodChange}
                  />
                )}
                {component.type === "one-time" && (
                  <DateEditor
                    date={component.date}
                    onDateChange={handleOneTimeDateChange}
                  />
                )}
              </TabsContent>
              <TabsContent value="inputs" className="pt-4">
                <InputsEditor
                  inputs={
                    component.type === "one-time"
                      ? component.calculation.inputs
                      : component.calculationPeriods.find(
                          (p) => p.id === selectedPeriodId,
                        )!.calculation.inputs
                  }
                  onInputChange={handleInputChange}
                />
              </TabsContent>
              <TabsContent value="calculation" className="pt-4">
                <CalculationEditor
                  componentId={component.id}
                  calculation={
                    component.type === "one-time"
                      ? component.calculation
                      : component.calculationPeriods.find(
                          (p) => p.id === selectedPeriodId,
                        )!.calculation
                  }
                  onCalculationChange={handleCalculationChange}
                />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSave}>
            <Save />
            {t("button-save")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
