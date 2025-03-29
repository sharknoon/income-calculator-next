"use client";

import { InputValue } from "@/lib/types";
import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "sonner";

interface InputValuesContextType {
  inputValues: Record<string, Record<string, Record<string, InputValue>>>;
  updateInputValue: (
    componentID: string,
    periodID: string,
    inputID: string,
    value: InputValue,
  ) => void;
}

const InputValuesContext = createContext<InputValuesContextType | undefined>(
  undefined,
);

export function InputValuesProvider({ children }: { children: ReactNode }) {
  const loadSavedInputValues = () => {
    if (typeof window !== "undefined") {
      const savedInputValues: Record<
        string,
        Record<string, Record<string, InputValue>>
      > = {};
      for (const key in localStorage) {
        if (key.startsWith("incomeCalculator.inputValues.")) {
          const componentID = key.replace("incomeCalculator.inputValues.", "");
          try {
            savedInputValues[componentID] = JSON.parse(
              localStorage.getItem(key) || "{}",
            );
          } catch (error) {
            console.error(
              "Could not parse input values from localStorage",
              localStorage.getItem(key) || "{}",
              error,
            );
            toast.error(
              "Could not parse input values from localstorage" + error,
            );
          }
        }
      }
      return savedInputValues;
    }
    return {};
  };

  // Record<componentID, Record<periodID, Record<inputID, InputValue>>>
  const [inputValues, setInputValues] = useState<
    Record<string, Record<string, Record<string, InputValue>>>
  >(loadSavedInputValues());

  const updateInputValue = (
    componentID: string,
    periodID: string,
    inputID: string,
    value: InputValue,
  ) => {
    if (value === undefined || value === null) {
      return;
    }

    const newInputValues = { ...inputValues };
    if (!newInputValues[componentID]) {
      newInputValues[componentID] = {
        [periodID]: {},
      };
    }
    if (!newInputValues[componentID][periodID]) {
      newInputValues[componentID][periodID] = {};
    }
    newInputValues[componentID][periodID][inputID] = value;

    if (typeof window !== "undefined") {
      localStorage.setItem(
        `incomeCalculator.inputValues.${componentID}`,
        JSON.stringify(newInputValues[componentID]),
      );
    }

    setInputValues(newInputValues);
  };

  return (
    <InputValuesContext.Provider value={{ inputValues, updateInputValue }}>
      {children}
    </InputValuesContext.Provider>
  );
}

export function useInputValues() {
  const context = useContext(InputValuesContext);
  if (!context) {
    throw new Error(
      "useInputValues must be used within an InputValuesProvider",
    );
  }
  return context;
}
