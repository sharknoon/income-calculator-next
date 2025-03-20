"use client";

import type React from "react";

import { useState } from "react";
import { useComponents } from "@/context/components-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PeriodEditor } from "@/components/period-editor";
import { InputsEditor } from "@/components/inputs-editor";
import { CalculationEditor } from "@/components/calculation-editor";

export function ComponentEditor() {
  const { components, selectedComponentId, updateComponent } = useComponents();
  const selectedComponent = components.find(
    (c) => c.id === selectedComponentId,
  );
  const [editorTab, setEditorTab] = useState("details");

  if (!selectedComponent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Component Selected</CardTitle>
          <CardDescription>
            Select a component from the Components tab or create a new one to
            edit it here.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateComponent({
      ...selectedComponent,
      name: e.target.value,
    });
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    updateComponent({
      ...selectedComponent,
      description: e.target.value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Edit Component</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <Input
              value={selectedComponent.name}
              onChange={handleNameChange}
              className="text-xl font-bold"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={selectedComponent.description || ""}
                onChange={handleDescriptionChange}
                placeholder="Describe this income component"
                className="mt-1"
              />
            </div>

            <Tabs
              value={editorTab}
              onValueChange={setEditorTab}
              className="w-full mt-6"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Period</TabsTrigger>
                <TabsTrigger value="inputs">Inputs</TabsTrigger>
                <TabsTrigger value="calculation">Calculation</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="py-4">
                <PeriodEditor component={selectedComponent} />
              </TabsContent>
              <TabsContent value="inputs" className="py-4">
                <InputsEditor component={selectedComponent} />
              </TabsContent>
              <TabsContent value="calculation" className="py-4">
                <CalculationEditor component={selectedComponent} />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
