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
import { useTranslations } from "next-intl";

export function ComponentsList() {
  const { components, addComponent } = useComponents();
  const router = useRouter();
  const t = useTranslations("ComponentsList");

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
    };
    fileInput.click();
  };

  const handleAddComponent = () => {
    const newId = (Math.random() + 1).toString(36).substring(7);
    addComponent({
      id: newId,
      name: t("new-component-name"),
      description: "",
      type: "recurring",
      calculationPeriods: [
        {
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
        },
      ],
    });
    router.push(`/component-editor/${newId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between">
        <h2 className="text-2xl font-bold">{t("title")}</h2>
        <div className="flex gap-2 justify-end md:justify-start">
          <Button variant="outline" onClick={handleUploadComponent}>
            <Upload />
          </Button>
          <Button onClick={handleAddComponent}>
            <Plus className="mr-2 size-4" />
            {t("button-add-component")}
          </Button>
        </div>
      </div>

      {components.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("card-title-no-components")}</CardTitle>
            <CardDescription>
              {t("card-description-no-components")}
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
