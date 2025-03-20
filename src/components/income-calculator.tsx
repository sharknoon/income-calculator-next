"use client";

import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComponentsList } from "@/components/components-list";
import { ComponentEditor } from "@/components/component-editor";
import { CalculationView } from "@/components/calculation-view";
import { ComponentsProvider } from "@/context/components-context";
import { toast } from "sonner";

export function IncomeCalculator() {
  const [activeTab, setActiveTab] = useState("components");
  const storageEventAttached = useRef(false);

  // Show "Saved" indicator briefly when localStorage changes
  useEffect(() => {
    if (typeof window !== "undefined" && !storageEventAttached.current) {
      const handleStorage = () => toast.success("Saved");

      window.addEventListener("storage", handleStorage);
      storageEventAttached.current = true;

      return () => {
        window.removeEventListener("storage", handleStorage);
        storageEventAttached.current = false;
      };
    }
  }, []);

  return (
    <ComponentsProvider>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="calculation">Calculation</TabsTrigger>
        </TabsList>
        <TabsContent value="components" className="py-4">
          <ComponentsList />
        </TabsContent>
        <TabsContent value="editor" className="py-4">
          <ComponentEditor />
        </TabsContent>
        <TabsContent value="calculation" className="py-4">
          <CalculationView />
        </TabsContent>
      </Tabs>
    </ComponentsProvider>
  );
}
