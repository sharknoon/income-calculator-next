"use client";

import { Edit, Trash2, Calendar } from "lucide-react";
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
import type { Component } from "@/types/income";
import { mergeDatePeriods } from "@/lib/date";

interface ComponentCardProps {
  component: Component;
}

export function ComponentCard({ component }: ComponentCardProps) {
  const { removeComponent } = useComponents();
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/component-editor/${component.id}`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{component.name}</CardTitle>
          <Badge variant="outline">
            {component.type === "one-time" ? "One-time" : "Recurring"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {component.description || "No description provided"}
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
                <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                <span className="font-medium mr-1">Period {index + 1}:</span>
                <span className="text-muted-foreground">
                  ({period.startDate.toLocaleString()} to{" "}
                  {period.endDate?.toLocaleString() || "indefinite"})
                </span>
              </div>
            ))}
          {component.type === "one-time" && (
            <div className="flex items-center text-sm border rounded-md p-2">
              <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <span className="font-medium mr-1">Date:</span>
              <span className="text-muted-foreground">
                {component.date.toLocaleString()}
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
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button size="sm" onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
}
