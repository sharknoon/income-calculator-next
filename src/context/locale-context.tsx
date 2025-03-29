"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";

type Locale = "en" | "de";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  children: React.ReactNode;
  defaultLocale?: Locale;
}

export function LocaleProvider({
  children,
  defaultLocale = "en",
}: LocaleProviderProps) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const savedLocale = localStorage.getItem("locale") as Locale | null;
    if (savedLocale && (savedLocale === "en" || savedLocale === "de")) {
      setLocale(savedLocale);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("locale", locale);
  }, [locale]);

  const value = {
    locale,
    setLocale,
  };

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
};
