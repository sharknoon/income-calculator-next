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
import type { Component, Period } from "@/types/income";
import { Temporal } from "@js-temporal/polyfill";

interface ComponentCardProps {
  component: Component;
}

export function ComponentCard({ component }: ComponentCardProps) {
  const { removeComponent } = useComponents();
  const router = useRouter();

  const getPeriodLabel = (period: Period) => {
    return `${period.date.frequency.charAt(0).toUpperCase() + period.date.frequency.slice(1)}`;
  };

  const formatDate = (date: Temporal.PlainDate) => {
    return date.toLocaleString("en-US");
  };

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
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          {component.description || "No description provided"}
        </p>

        <div className="space-y-2">
          {component.type === "recurring" &&
            component.periods.map((period, index) => (
              <div
                key={index}
                className="flex items-center text-sm border rounded-md p-2"
              >
                <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                <span className="font-medium mr-1">Period {index + 1}:</span>
                <span className="text-muted-foreground mr-1">
                  {getPeriodLabel(period)}
                </span>
                <span className="text-muted-foreground">
                  ({formatDate(period.date.startDate)})
                </span>
              </div>
            ))}
          {component.type === "one-time" && (
            <div className="flex items-center text-sm border rounded-md p-2">
              <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <span className="font-medium mr-1">Date:</span>
              <span className="text-muted-foreground">
                {formatDate(component.date)}
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
