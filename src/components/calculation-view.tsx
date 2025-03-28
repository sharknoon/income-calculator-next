"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Calendar } from "lucide-react";
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { calculate, ComponentResult } from "@/lib/calculation";
import { useInputValues } from "@/context/input-values-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "./ui/label";
import { plainDateToTZDate, tzDateToPlainDate } from "@/lib/date";
import { TZDate } from "react-day-picker";

export function CalculationView() {
  const { components } = useComponents();
  const { inputValues } = useInputValues();

  const [startDate, setStartDate] = useState<Temporal.PlainDate>(
    Temporal.Now.plainDateISO().with({ day: 1 }),
  );
  const [endDate, setEndDate] = useState<Temporal.PlainDate>(
    Temporal.Now.plainDateISO().with({
      day: Temporal.Now.plainDateISO().daysInMonth,
    }),
  );
  const [componentResults, setComponentResults] = useState<
    Array<ComponentResult>
  >([]);
  const [calculationTab, setCalculationTab] = useState("inputs");
  const [error, setError] = useState<string | null>(null);

  const formatDate = (date: Temporal.PlainDate | undefined) => {
    if (!date) return "";
    return date.toLocaleString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  useEffect(() => {
    try {
      const results = calculate(components, inputValues, startDate, endDate);
      setComponentResults(results);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [components, inputValues, startDate, endDate]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Income Calculation</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Date Range</CardTitle>
            <CardDescription>
              Select the period for your income calculation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formatDate(startDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      timeZone="UTC"
                      mode="single"
                      selected={plainDateToTZDate(startDate)}
                      onSelect={(date) =>
                        date
                          ? setStartDate(
                              tzDateToPlainDate(new TZDate(date, "UTC")),
                            )
                          : null
                      }
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formatDate(endDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      timeZone="UTC"
                      mode="single"
                      selected={plainDateToTZDate(endDate)}
                      onSelect={(date) =>
                        date
                          ? setEndDate(
                              tzDateToPlainDate(new TZDate(date, "UTC")),
                            )
                          : null
                      }
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
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
                    componentResults.reduce(
                      (total, result) =>
                        total +
                        result.results.reduce((sum, r) => sum + r.amount, 0),
                      0,
                    ),
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Components:</span>
                <span>{components.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Date:</span>
                <span>
                  {formatDate(startDate)} to {formatDate(endDate)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
                startDate={startDate}
                endDate={endDate}
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
                  componentResults.map((result) => {
                    if (result.results.length === 1) {
                      return (
                        <div
                          key={result.id}
                          className="flex justify-between items-center py-2 border-b"
                        >
                          <span>{result.name}</span>
                          <span className="font-medium">
                            {formatCurrency(result.results[0].amount)}
                          </span>
                        </div>
                      );
                    } else if (result.results.length > 1) {
                      return (
                        <div key={result.id} className="border-b">
                          {result.results.map((subResult, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center py-2"
                            >
                              <span>
                                {result.name} ({formatDate(subResult.date)})
                              </span>
                              <span className="font-medium">
                                {formatCurrency(subResult.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
