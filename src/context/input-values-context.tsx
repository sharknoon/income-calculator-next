"use client";

import { InputValue } from "@/types/income";
import { createContext, ReactNode, useContext, useState } from "react";

interface InputValuesContextType {
  inputValues: Record<string, Record<string, InputValue>>;
  updateInputValue: (
    componentID: string,
    inputID: string,
    value: InputValue,
  ) => void;
  updateInputValues: (
    inputValues: Record<string, Record<string, InputValue>>,
  ) => void;
}

const InputValuesContext = createContext<InputValuesContextType | undefined>(
  undefined,
);

export function InputValuesProvider({ children }: { children: ReactNode }) {
  const [inputValues, setInputValues] = useState<
    Record<string, Record<string, InputValue>>
  >({});

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
  };

  const updateInputValues = (
    newInputValues: Record<string, Record<string, InputValue>>,
  ) => {
    setInputValues(newInputValues);
  };

  return (
    <InputValuesContext.Provider value={{ inputValues, updateInputValue, updateInputValues }}>
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
