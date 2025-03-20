"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useComponents } from "@/context/components-context";
import { ComponentCard } from "@/components/component-card";
import { Temporal } from "@js-temporal/polyfill";

export function ComponentsList() {
  const {
    components,
    addComponent,
    setSelectedComponentId,
    clearAllComponents,
  } = useComponents();

  const handleAddComponent = () => {
    const newId = `component-${Temporal.Now.plainDateTimeISO()}`;
    addComponent({
      id: newId,
      name: "New Component",
      periods: [
        {
          date: {
            type: "recurring",
            startDate: Temporal.Now.plainDateISO().with({ day: 1 }),
            frequency: "monthly",
            every: 1,
            each: 1,
          },
          dependencies: [],
          inputs: [],
          calculate: "new BigNumber(0)",
        },
      ],
    });
    setSelectedComponentId(newId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Income Components</h2>
        <div className="flex gap-2">
          {components.length > 0 && (
            <Button variant="outline" onClick={clearAllComponents}>
              Clear All
            </Button>
          )}
          <Button onClick={handleAddComponent}>
            <Plus className="mr-2 h-4 w-4" />
            Add Component
          </Button>
        </div>
      </div>

      {components.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Components</CardTitle>
            <CardDescription>
              You haven&apos;t added any income components yet. Click the button
              above to get started.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {components.map((component) => (
            <ComponentCard key={component.id} component={component} />
          ))}
        </div>
      )}
    </div>
  );
}
