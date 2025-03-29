"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComponentsList } from "@/components/components-list";
import { CalculationView } from "@/components/calculation-view";
import { InputValuesProvider } from "@/context/input-values-context";
import { useTranslations } from "next-intl";

export function IncomeCalculator() {
  const [activeTab, setActiveTab] = useState("components");
  const t = useTranslations("IncomeCalculator");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="components">{t("tab-components")}</TabsTrigger>
        <TabsTrigger value="calculation">{t("tab-calculation")}</TabsTrigger>
      </TabsList>
      <TabsContent value="components" className="py-4">
        <ComponentsList />
      </TabsContent>
      <TabsContent value="calculation" className="py-4">
        <InputValuesProvider>
          <CalculationView />
        </InputValuesProvider>
      </TabsContent>
    </Tabs>
  );
}
