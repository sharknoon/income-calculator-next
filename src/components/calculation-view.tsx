"use client";

import type React from "react";

import { useEffect, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComponentsInputs } from "@/components/components-inputs";
import { Temporal } from "@js-temporal/polyfill";
import { MonthYearSelector } from "./month-year-selector";
import { calculate, ComponentResult } from "@/lib/calculation";
import { useInputValues } from "@/context/input-values-context";

export function CalculationView() {
  const { components } = useComponents();
  const { inputValues } = useInputValues();

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [date, setDate] = useState<Temporal.PlainYearMonth>(
    Temporal.Now.plainDateISO().toPlainYearMonth(),
  );
  const [componentResults, setComponentResults] = useState<
    Array<ComponentResult>
  >([]);
  const [calculationTab, setCalculationTab] = useState("inputs");

  const formatDate = (date: Temporal.PlainYearMonth | undefined) => {
    if (!date) return "";
    return date.toLocaleString(undefined, {
      calendar: date.getCalendar(),
      year: "numeric",
      month: "long",
    });
  };

  const formatCurrency = (amount: number) => {
    return Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  useEffect(() => {
    const results = calculate(components, date, inputValues);
    setComponentResults(results);
  }, [components, date, inputValues]);

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
              <div className="text-sm font-medium leading-none">Month</div>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="self-start text-left">
                    <Calendar className="mr-2 h-4 w-4" />
                    {formatDate(date)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <MonthYearSelector
                    defaultValue={date}
                    onChange={setDate}
                    onApply={() => setIsCalendarOpen(false)}
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
                <span className="text-xl font-bold">
                  {formatCurrency(
                    componentResults.length > 0
                      ? componentResults[componentResults.length - 1].amount
                      : 0,
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Components:</span>
                <span>{components.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Date:</span>
                <span>{formatDate(date)}</span>
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
              <ComponentsInputs
                components={components}
                date={date.toPlainDate({ day: 1 })}
              />
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
                {componentResults.length === 0 ? (
                  <p className="text-muted-foreground">
                    No components to display
                  </p>
                ) : (
                  componentResults.map((result) => (
                    <div
                      key={result.id}
                      className="flex justify-between items-center py-2 border-b"
                    >
                      <span>{result.name}</span>
                      <span className="font-medium">
                        {formatCurrency(result.amount)}
                      </span>
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
