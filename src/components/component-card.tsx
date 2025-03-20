"use client";

import { Edit, Trash2 } from "lucide-react";
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

interface ComponentCardProps {
  component: Component;
}

export function ComponentCard({ component }: ComponentCardProps) {
  const { removeComponent, setSelectedComponentId } = useComponents();

  const getPeriodLabel = (component: Component) => {
    const period = component.periods[0];
    if (!period) return "No periods";

    if (period.date.type === "one-time") {
      return "One-time";
    } else {
      return `${period.date.frequency.charAt(0).toUpperCase() + period.date.frequency.slice(1)}`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{component.name}</CardTitle>
          <Badge variant="outline">{getPeriodLabel(component)}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {component.description || "No description provided"}
        </p>
        <div className="mt-2">
          <p className="text-sm">
            <span className="font-medium">Inputs:</span>{" "}
            {component.periods[0]?.inputs.length || 0}
          </p>
          <p className="text-sm">
            <span className="font-medium">Dependencies:</span>{" "}
            {component.periods[0]?.dependencies.length || 0}
          </p>
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
        <Button size="sm" onClick={() => setSelectedComponentId(component.id)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
}
