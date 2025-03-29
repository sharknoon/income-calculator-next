"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
} from "react";
import type { Component } from "@/lib/types";
import { Temporal } from "@js-temporal/polyfill";
import { toast } from "sonner";

interface ComponentsContextType {
  components: Component[];
  addComponent: (component: Component) => void;
  updateComponent: (oldID: string, component: Component) => void;
  removeComponent: (id: string) => void;
}

const ComponentsContext = createContext<ComponentsContextType | undefined>(
  undefined,
);

export function ComponentsProvider({ children }: { children: ReactNode }) {
  const [components, setComponents] = useState<Component[]>([]);

  // Load from localStorage after component mounts (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedComponents = localStorage.getItem(
          "incomeCalculator.components",
        );
        if (savedComponents) {
          const parsedComponents = JSON.parse(savedComponents, (key, value) => {
            // Handle date objects that were serialized
            if (
              (key === "date" || key === "startDate" || key === "endDate") &&
              value
            ) {
              // Reconstruct the date object
              return Temporal.PlainDate.from(value);
            }
            return value;
          });
          setComponents(parsedComponents);
        }
      } catch (error) {
        console.error("Failed to load components from localStorage:", error);
      }
    }
  }, []);

  // Save to localStorage whenever components change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "incomeCalculator.components",
          JSON.stringify(components),
        );
      } catch (error) {
        console.error("Failed to save components to localStorage:", error);
      }
    }
    toast.success("Component saved successfully");
  }, [components]);

  const addComponent = (component: Component) => {
    setComponents((prev) => [...prev, component]);
  };

  const updateComponent = (oldID: string, component: Component) => {
    setComponents((prev) => prev.map((c) => (c.id === oldID ? component : c)));
  };

  const removeComponent = (id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <ComponentsContext.Provider
      value={{
        components,
        addComponent,
        updateComponent,
        removeComponent,
      }}
    >
      {children}
    </ComponentsContext.Provider>
  );
}

export function useComponents() {
  const context = useContext(ComponentsContext);
  if (context === undefined) {
    throw new Error("useComponents must be used within a ComponentsProvider");
  }
  return context;
}
