"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useComponents } from "@/context/components-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PeriodEditor } from "@/components/period-editor";
import { InputsEditor } from "@/components/inputs-editor";
import { CalculationEditor } from "@/components/calculation-editor";
import { Temporal } from "@js-temporal/polyfill";

export default function ComponentEditorPage() {
  const { components, updateComponent } = useComponents();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [component, setComponent] = useState(
    components.find((c) => c.id === params.id)
  );
  const [editorTab, setEditorTab] = useState("details");
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(0);

  useEffect(() => {
    console.log(params.id);
    console.log(components.map((c) => c.id));
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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedComponent = {
      ...component,
      name: e.target.value,
    };
    setComponent(updatedComponent);
    updateComponent(updatedComponent);
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const updatedComponent = {
      ...component,
      description: e.target.value,
    };
    setComponent(updatedComponent);
    updateComponent(updatedComponent);
  };

  const handleSave = () => {
    router.push("/");
  };

  const addNewPeriod = () => {
    // Create a new period based on the last period
    const lastPeriod = component.periods[component.periods.length - 1];
    const newPeriod = {
      ...JSON.parse(JSON.stringify(lastPeriod)), // Deep clone
      date: {
        ...lastPeriod.date,
        startDate: Temporal.Now.plainDateISO().with({ day: 1 }),
      },
    };

    const updatedComponent = {
      ...component,
      periods: [...component.periods, newPeriod],
    };

    setComponent(updatedComponent);
    updateComponent(updatedComponent);
    setSelectedPeriodIndex(updatedComponent.periods.length - 1);
  };

  const removePeriod = (index: number) => {
    if (component.periods.length <= 1) {
      return; // Don't remove the last period
    }

    const updatedPeriods = [...component.periods];
    updatedPeriods.splice(index, 1);

    const updatedComponent = {
      ...component,
      periods: updatedPeriods,
    };

    setComponent(updatedComponent);
    updateComponent(updatedComponent);
    setSelectedPeriodIndex(
      Math.min(selectedPeriodIndex, updatedPeriods.length - 1)
    );
  };

  const formatPeriodDate = (period: any) => {
    if (!period.date.startDate) return "No start date";

    try {
      const date = period.date.startDate;
      return typeof date === "string"
        ? date
        : `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
    } catch (e) {
      return "Invalid date";
    }
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
        <CardHeader>
          <CardTitle>
            <Input
              value={component.name}
              onChange={handleNameChange}
              className="text-xl font-bold"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
              <div className="flex justify-between items-center">
                <Label>Periods</Label>
                <Button variant="outline" size="sm" onClick={addNewPeriod}>
                  <Plus className="h-4 w-4 mr-1" /> Add Period
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {component.periods.map((period, index) => (
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
                      Period {index + 1} ({formatPeriodDate(period)})
                    </span>
                    {component.periods.length > 1 && (
                      <button
                        className="text-xs hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePeriod(index);
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Tabs
              value={editorTab}
              onValueChange={setEditorTab}
              className="w-full mt-6"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Period</TabsTrigger>
                <TabsTrigger value="inputs">Inputs</TabsTrigger>
                <TabsTrigger value="calculation">Calculation</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="py-4">
                <PeriodEditor component={component} />
              </TabsContent>
              <TabsContent value="inputs" className="py-4">
                <InputsEditor component={component} />
              </TabsContent>
              <TabsContent value="calculation" className="py-4">
                <CalculationEditor component={component} />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSave}>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
