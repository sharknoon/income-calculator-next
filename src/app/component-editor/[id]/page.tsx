"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, X } from "lucide-react";
import { useComponents } from "@/context/components-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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
} from "@/types/income";
import { DateEditor } from "@/components/date-editor";

export default function ComponentEditorPage() {
  const { components, updateComponent } = useComponents();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [component, setComponent] = useState<Component | undefined>(
    components.find((c) => c.id === params.id),
  );
  const [editorTab, setEditorTab] = useState("details");
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(0);

  useEffect(() => {
    const selectedComponent = components.find((c) => c.id === params.id);
    if (!selectedComponent) {
      router.push("/");
    } else {
      setComponent(selectedComponent);
      // Reset to first period when component changes
      setSelectedPeriodIndex(0);
    }
  }, [components, params.id, router]);

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
    updateComponent(component.id, updatedComponent);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedComponent = {
      ...component,
      name: e.target.value,
    };
    setComponent(updatedComponent);
    updateComponent(updatedComponent.id, updatedComponent);
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const updatedComponent = {
      ...component,
      description: e.target.value,
    };
    setComponent(updatedComponent);
    updateComponent(updatedComponent.id, updatedComponent);
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
          func: "return new BigNumber(0)",
        },
      };
    } else {
      updatedComponent = {
        id: component.id,
        name: component.name,
        type: "recurring",
        calculationPeriods: [
          {
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
              func: "return new BigNumber(0)",
            },
          },
        ],
      };
    }
    setComponent(updatedComponent);
    updateComponent(updatedComponent.id, updatedComponent);
  };

  const handleRecurringPeriodChange = (period: Period) => {
    if (component.type !== "recurring") {
      return;
    }

    const updatedComponent = {
      ...component,
      calculationPeriods: component.calculationPeriods.map((p, i) =>
        i === selectedPeriodIndex ? { ...p, period: period } : p,
      ),
    };
    setComponent(updatedComponent);
    updateComponent(updatedComponent.id, updatedComponent);
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
    updateComponent(updatedComponent.id, updatedComponent);
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
        calculationPeriods: component.calculationPeriods.map((p, i) =>
          i === selectedPeriodIndex
            ? { ...p, calculation: { ...p.calculation, inputs: inputs } }
            : p,
        ),
      };
    }

    setComponent(updatedComponent);
    updateComponent(updatedComponent.id, updatedComponent);
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
        calculationPeriods: component.calculationPeriods.map((p, i) =>
          i === selectedPeriodIndex ? { ...p, calculation: calculation } : p,
        ),
      };
    }

    setComponent(updatedComponent);
    updateComponent(updatedComponent.id, updatedComponent);
  };

  const addNewCalculationPeriod = () => {
    if (component.type !== "recurring") {
      return;
    }

    const newCalculationPeriod: CalculationPeriod = {
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
        func: "return new BigNumber(0)",
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
    updateComponent(updatedComponent.id, updatedComponent);
    setSelectedPeriodIndex(updatedComponent.calculationPeriods.length - 1);
  };

  const removeCalculationPeriod = (index: number) => {
    if (component.type !== "recurring") {
      return;
    }

    if (component.calculationPeriods.length <= 1) {
      return; // Don't remove the last period
    }

    const updatedCalculationPeriods = [...component.calculationPeriods];
    updatedCalculationPeriods.splice(index, 1);

    const updatedComponent: RecurringComponent = {
      ...component,
      calculationPeriods: updatedCalculationPeriods,
    };

    setComponent(updatedComponent);
    updateComponent(updatedComponent.id, updatedComponent);
    setSelectedPeriodIndex(updatedCalculationPeriods.length - 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">Edit Component</h2>
      </div>

      <Card>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="id">ID</Label>
              <Input
                id="id"
                value={component.id || ""}
                onChange={handleIDChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={component.name || ""}
                onChange={handleNameChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={component.description || ""}
                onChange={handleDescriptionChange}
                placeholder="Describe this income component"
                className="mt-1"
              />
            </div>

            <div className="space-y-2">
              <Label>Component Type</Label>
              <RadioGroup
                value={component.type}
                onValueChange={handleTypeChange}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="one-time" id="one-time" />
                  <Label htmlFor="one-time" className="cursor-pointer">
                    One-time payment
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="recurring" id="recurring" />
                  <Label htmlFor="recurring" className="cursor-pointer">
                    Recurring payment
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {component.type === "recurring" && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Periods</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addNewCalculationPeriod}
                  >
                    <Plus className="size-4 mr-1" /> Add Period
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {component.calculationPeriods.map((period, index) => (
                    <div
                      key={index}
                      className={`
                      px-3 py-1 rounded-md cursor-pointer flex items-center gap-2
                      ${
                        selectedPeriodIndex === index
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }
                    `}
                      onClick={() => setSelectedPeriodIndex(index)}
                    >
                      <span>
                        Period {index + 1} (
                        {period.period.startDate.toLocaleString()} to{" "}
                        {period.period.endDate?.toLocaleString() ||
                          "indefinite"}
                        )
                      </span>
                      {component.calculationPeriods.length > 1 && (
                        <button
                          className="text-xs hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCalculationPeriod(index);
                          }}
                        >
                          <X className="size-3" />
                        </button>
                      )}
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
                  {component.type === "one-time" ? "Date" : "Period"}
                </TabsTrigger>
                <TabsTrigger value="inputs">Inputs</TabsTrigger>
                <TabsTrigger value="calculation">Calculation</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="pt-4">
                {component.type === "recurring" && (
                  <PeriodEditor
                    period={
                      component.calculationPeriods[selectedPeriodIndex]?.period
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
                      : component.calculationPeriods[selectedPeriodIndex]
                          ?.calculation.inputs
                  }
                  onInputChange={handleInputChange}
                />
              </TabsContent>
              <TabsContent value="calculation" className="pt-4">
                <CalculationEditor
                  calculation={
                    component.type === "one-time"
                      ? component.calculation
                      : component.calculationPeriods[selectedPeriodIndex]
                          ?.calculation
                  }
                  onCalculationChange={handleCalculationChange}
                />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
