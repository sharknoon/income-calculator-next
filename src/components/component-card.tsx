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

interface ComponentCardProps {
  component: Component;
}

export function ComponentCard({ component }: ComponentCardProps) {
  const { removeComponent } = useComponents();
  const router = useRouter();
  const t = useTranslations("ComponentCard");
  const locale = useLocale();

  const handleEdit = () => {
    router.push(`/component-editor/${component.id}`);
  };

  return (
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
                      period.endDate?.toLocaleString(locale) || t("indefinite"),
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
      <CardFooter className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => removeComponent(component.id)}
        >
          <Trash2 className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const blob = new Blob([JSON.stringify(component, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.setAttribute("href", url);
            a.setAttribute("download", `${component.name}.json`);
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Download className="size-4" />
        </Button>
        <Button size="sm" onClick={handleEdit}>
          <Edit className="mr-2 size-4" />
          {t("button-edit")}
        </Button>
      </CardFooter>
    </Card>
  );
}
