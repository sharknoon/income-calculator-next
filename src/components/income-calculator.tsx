"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComponentsList } from "@/components/components-list";
import { CalculationView } from "@/components/calculation-view";

export function IncomeCalculator() {
  const [activeTab, setActiveTab] = useState("components");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="components">Components</TabsTrigger>
        <TabsTrigger value="calculation">Calculation</TabsTrigger>
      </TabsList>
      <TabsContent value="components" className="py-4">
        <ComponentsList />
      </TabsContent>
      <TabsContent value="calculation" className="py-4">
        <CalculationView />
      </TabsContent>
    </Tabs>
  );
}
