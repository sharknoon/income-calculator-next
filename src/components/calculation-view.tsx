"use client";

import type React from "react";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { useComponents } from "@/context/components-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComponentInputs } from "@/components/component-inputs";
import { Temporal } from "@js-temporal/polyfill";
import { tzDateToPlainDate, plainDateToTZDate } from "@/lib/date";
import { TZDate } from "react-day-picker";

export function CalculationView() {
  const { components } = useComponents();

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [date, setDate] = useState<Temporal.PlainDate>(
    Temporal.Now.plainDateISO()
  );
  const [calculationTab, setCalculationTab] = useState("inputs");

  const formatDate = (date: Temporal.PlainDate | undefined) => {
    if (!date) return "";
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "long"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Income Calculation</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Date</CardTitle>
            <CardDescription>
              Select the month for your income calculation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Label>Month</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="self-start text-left">
                    <Calendar className="mr-2 h-4 w-4" />
                    {formatDate(date)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    timeZone="UTC"
                    mode="single"
                    selected={plainDateToTZDate(date)}
                    defaultMonth={plainDateToTZDate(date)}
                    onSelect={(date) => {
                      if (date) {
                        setDate(
                          tzDateToPlainDate(new TZDate(date, "UTC"))
                        );
                        setIsCalendarOpen(false);
                      }
                    }}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Your income calculation summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Income:</span>
                <span className="text-xl font-bold">$0.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Components:</span>
                <span>{components.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Date:</span>
                <span>
                  {formatDate(date)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={calculationTab}
        onValueChange={setCalculationTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inputs">Inputs</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
        </TabsList>
        <TabsContent value="inputs" className="py-4">
          <div className="space-y-6">
            {components.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Components</CardTitle>
                  <CardDescription>
                    You haven&apos;t added any income components yet. Go to the
                    Components tab to add some.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              components.map((component) => (
                <ComponentInputs key={component.id} component={component} date={date} />
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="breakdown" className="py-4">
          <Card>
            <CardHeader>
              <CardTitle>Income Breakdown</CardTitle>
              <CardDescription>
                Detailed breakdown of your income components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {components.length === 0 ? (
                  <p className="text-muted-foreground">
                    No components to display
                  </p>
                ) : (
                  components.map((component) => (
                    <div
                      key={component.id}
                      className="flex justify-between items-center py-2 border-b"
                    >
                      <span>{component.name}</span>
                      <span className="font-medium">$0.00</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {children}
    </label>
  );
}
