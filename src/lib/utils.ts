import { Temporal } from "@js-temporal/polyfill";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function plainDateToJsDate(plainDate: Temporal.PlainDate) {
  return new Date(plainDate.toString());
}

export function jsDateToPlainDate(jsDate: Date) {
  return Temporal.PlainDate.from(jsDate.toISOString().substring(0, 10));
}
