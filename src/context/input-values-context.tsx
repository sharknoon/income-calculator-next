"use client";

import { InputValue } from "@/types/income";
import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "sonner";

interface InputValuesContextType {
  inputValues: Record<string, Record<string, InputValue>>;
  updateInputValue: (
    componentID: string,
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
      const savedInputValues: Record<string, Record<string, InputValue>> = {};
      for (const key in localStorage) {
        if (key.startsWith("incomeCalculator.inputValues.")) {
          const componentID = key.replace("incomeCalculator.inputValues.", "");
          try {
            savedInputValues[componentID] = JSON.parse(
              localStorage.getItem(key) || "{}",
            );
          } catch (error) {
            toast.error("Could not save input values" + error);
          }
        }
      }
      return savedInputValues;
    }
    return {};
  };

  const [inputValues, setInputValues] = useState<
    Record<string, Record<string, InputValue>>
  >(loadSavedInputValues());

  const updateInputValue = (
    componentID: string,
    inputID: string,
    value: InputValue,
  ) => {
    setInputValues((prevInputValues) => {
      const newInputValues = { ...prevInputValues };
      if (!newInputValues[componentID]) {
        newInputValues[componentID] = {};
      }
      newInputValues[componentID][inputID] = value;
      return newInputValues;
    });
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `incomeCalculator.inputValues.${componentID}`,
        JSON.stringify(inputValues[componentID]),
      );
    }
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
