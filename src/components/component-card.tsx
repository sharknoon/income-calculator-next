"use client";

import { Edit, Trash2, Calendar, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useComponents } from "@/context/components-context";
import type { Component } from "@/lib/types";
import { mergeDatePeriods } from "@/lib/date";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface ComponentCardProps {
  component: Component;
}

export function ComponentCard({ component }: ComponentCardProps) {
  const { removeComponent, components } = useComponents();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("ComponentCard");
  const locale = useLocale();

  const handleRemove = () => {
    // Check if the component is used as a dependency in any other component
    for (const c of components) {
      if (component.id === c.id) {
        continue;
      }
      const dependencies = new Set<string>();
      if (c.type === "recurring") {
        for (const period of c.calculationPeriods) {
          for (const dependency of period.calculation.dependencies) {
            dependencies.add(dependency);
          }
        }
      } else if (c.type === "one-time") {
        for (const dependency of c.calculation.dependencies) {
          dependencies.add(dependency);
        }
      }
      if (dependencies.has(component.id)) {
        setError(
          t("error-dependency", {
            component: component.name,
            dependendcomponent: c.name,
          }),
        );
        return;
      }
    }
    removeComponent(component.id);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(component, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `${component.name}.json`);
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEdit = () => {
    router.push(`/component-editor/${component.id}`);
  };

  return (
    <>
      <AlertDialog open={error !== null} onOpenChange={() => setError(null)}>
        <AlertDialogContent className="sm:min-w-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("alert-dialog-error-title")}</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>{t("alert-dialog-error-ok")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>{component.name}</CardTitle>
            <Badge variant="outline">
              {component.type === "one-time"
                ? t("badge-one-time")
                : t("badge-recurring")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {component.description || t("no-description")}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {component.type === "recurring" &&
              mergeDatePeriods(
                component.calculationPeriods.map((p) => p.period),
              ).map((period, index) => (
                <div
                  key={index}
                  className="flex items-center text-sm border rounded-md p-2"
                >
                  <Calendar className="size-3.5 mr-2 text-muted-foreground" />
                  <span className="font-medium mr-1">
                    {t("period-n", { period: index + 1 })}
                  </span>
                  <span className="text-muted-foreground">
                    {t("period-range", {
                      startDate: period.startDate.toLocaleString(locale),
                      endDate:
                        period.endDate?.toLocaleString(locale) ||
                        t("indefinite"),
                    })}
                  </span>
                </div>
              ))}
            {component.type === "one-time" && (
              <div className="flex items-center text-sm border rounded-md p-2">
                <Calendar className="size-3.5 mr-2 text-muted-foreground" />
                <span className="font-medium mr-1">{t("date")}</span>
                <span className="text-muted-foreground">
                  {component.date.toLocaleString(locale)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="mt-auto flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleRemove}>
            <Trash2 className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="size-4" />
          </Button>
          <Button size="sm" onClick={handleEdit}>
            <Edit className="mr-2 size-4" />
            {t("button-edit")}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
