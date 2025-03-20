import { Temporal } from "@js-temporal/polyfill";

export type Component = {
  id: string;
  name: string;
  description?: string;
  periods: Array<Period>;
};

export type Period = {
  date: OneTime | Recurring;
  dependencies: Array<string>;
  inputs: Array<Input>;
  calculate: string;
};

export type OneTime = {
  type: "one-time";
  date: Temporal.PlainDate;
};

export type Recurring = {
  type: "recurring";
  startDate: Temporal.PlainDate;
  endDate?: Temporal.PlainDate; // Default is infinite
} & (Daily | Weekly | Monthly | Yearly);

type Daily = {
  frequency: "daily";
  every: number;
};

type Weekly = {
  frequency: "weekly";
  every: number;
  weekdays: Array<
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday"
  >;
};

type Monthly = {
  frequency: "monthly";
  every: number;
} & ( // every 13th day of the month
  | { each: number }
  // every first Monday of the month
  | {
      day:
        | "Monday"
        | "Tuesday"
        | "Wednesday"
        | "Thursday"
        | "Friday"
        | "Saturday"
        | "Sunday"
        | "day"
        | "weekday"
        | "weekend-day";
      on: "first" | "second" | "third" | "fourth" | "next-to-last" | "last";
    }
);

type Yearly = {
  frequency: "yearly";
  every: number;
  months: Array<
    | "January"
    | "February"
    | "March"
    | "April"
    | "May"
    | "June"
    | "July"
    | "August"
    | "September"
    | "October"
    | "November"
    | "December"
  >;
} & ( // every 13th day of January
  | { each: number }
  // every first Monday of January
  | {
      day:
        | "Monday"
        | "Tuesday"
        | "Wednesday"
        | "Thursday"
        | "Friday"
        | "Saturday"
        | "Sunday"
        | "day"
        | "weekday"
        | "weekend-day";
      on: "first" | "second" | "third" | "fourth" | "next-to-last" | "last";
    }
);

export type Input = {
  id: string;
  name: string;
  description?: string;
  /** Whether the input is required. `undefined` means required. */
  required?: boolean;
} & (TextInput | NumberInput | SelectInput | RangeInput);

type TextInput = {
  type: "text";
  defaultValue?: string;
  minLength?: number;
  maxLength?: number;
  validation?: RegExp;
  placeholder?: string;
};

type NumberInput = {
  type: "number";
  defaultValue?: number;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  validation?: RegExp;
  placeholder?: string;
};

type SelectInput = {
  type: "select";
  options: Array<{ id: string; label: string }>;
  defaultOption?: string;
};

type RangeInput = {
  type: "range";
  min: number;
  max: number;
  step: number;
  defaultValue: number;
};
