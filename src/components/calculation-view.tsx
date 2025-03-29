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
import { useLocale, useTranslations } from "next-intl";

export function CalculationView() {
  const { components } = useComponents();
  const { inputValues } = useInputValues();
  const t = useTranslations("CalculationView");
  const locale = useLocale();

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
    return date.toLocaleString(locale);
  };

  const formatCurrency = (amount: number) => {
    return Intl.NumberFormat(locale, {
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
        <h2 className="text-2xl font-bold">{t("title")}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("card-date-range-title")}</CardTitle>
            <CardDescription>
              {t("card-date-range-description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("card-date-range-start-date")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left"
                    >
                      <Calendar className="mr-2 size-4" />
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
                <Label>{t("card-date-range-end-date")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left"
                    >
                      <Calendar className="mr-2 size-4" />
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
            <CardTitle>{t("card-summary-title")}</CardTitle>
            <CardDescription>{t("card-summary-description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {t("card-summary-total-income")}
                </span>
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
                <span className="font-medium">
                  {t("card-summary-components")}
                </span>
                <span>{components.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">{t("card-summary-period")}</span>
                <span>
                  {t("card-summary-period-range", {
                    startDate: formatDate(startDate),
                    endDate: formatDate(endDate),
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>{t("alert-error-title")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs
        value={calculationTab}
        onValueChange={setCalculationTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inputs">{t("tab-inputs")}</TabsTrigger>
          <TabsTrigger value="breakdown">{t("tab-breakdown")}</TabsTrigger>
        </TabsList>
        <TabsContent value="inputs" className="py-4">
          <div className="space-y-6">
            {components.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>{t("card-no-components-title")}</CardTitle>
                  <CardDescription>
                    {t("card-no-components-description")}
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
              <CardTitle>{t("card-breakdown-title")}</CardTitle>
              <CardDescription>
                {t("card-breakdown-description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {componentResults.length === 0 ? (
                  <p className="text-muted-foreground">
                    {t("card-breakdown-no-components")}
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
