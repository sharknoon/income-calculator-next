"use client";

import { Plus, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
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
  const { components, addComponent } = useComponents();
  const router = useRouter();

  const handleUploadComponent = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        try {
          if (!e.target) return;
          const component = JSON.parse(e.target.result as string);
          addComponent(component);
        } catch (error) {
          console.error(error);
        }
      };
      fileReader.readAsText(file);
    }
    fileInput.click();
  };

  const handleAddComponent = () => {
    const newId = (Math.random() + 1).toString(36).substring(7);
    addComponent({
      id: newId,
      name: "New Component",
      type: "recurring",
      calculationPeriods: [
        {
          period: {
            startDate: Temporal.Now.plainDateISO().with({ day: 1 }),
            frequency: "monthly",
            every: 1,
            dayOfMonthType: "position",
            on: "last",
            day: "friday",
          },
          calculation: {
            dependencies: [],
            inputs: [],
            func: "return 0;",
          },
        },
      ],
    });
    router.push(`/component-editor/${newId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Income Components</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleUploadComponent}><Upload /></Button>
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
