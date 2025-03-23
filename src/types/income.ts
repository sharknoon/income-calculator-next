import { Temporal } from "@js-temporal/polyfill";

type BaseComponent = {
  id: string;
  name: string;
  description?: string;
};

export type OneTimeComponent = BaseComponent & {
  type: "one-time";
  date: Temporal.PlainDate;
  calculation: Calculation;
};

export type RecurringComponent = BaseComponent & {
  type: "recurring";
  calculationPeriods: Array<CalculationPeriod>;
};

export type Component = OneTimeComponent | RecurringComponent;

export type CalculationPeriod = {
  period: Period;
  calculation: Calculation;
};

export type Calculation = {
  inputs: Array<Input>;
  dependencies: Array<string>;
  func: string; // js code
};

type BasePeriod = {
  startDate: Temporal.PlainDate;
  endDate?: Temporal.PlainDate; // Default is indefinite
};

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

type BaseMonthly = {
  frequency: "monthly";
  every: number;
};

type MonthlyDay = {
  dayOfMonthType: "day";
  each: number;
};

export type MonthlyPosition = {
  dayOfMonthType: "position";
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
};

type Monthly = BaseMonthly & (MonthlyDay | MonthlyPosition);

type BaseYearly = {
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
};

type YearlyDay = {
  dayOfMonthType: "day";
  each: number;
};

type YearlyPosition = {
  dayOfMonthType: "position";
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
};

type Yearly = BaseYearly & (YearlyDay | YearlyPosition);

export type Period = BasePeriod & (Daily | Weekly | Monthly | Yearly);

export type BaseInput = {
  id: string;
  name: string;
  description?: string;
  /** Whether the input is required. `undefined` means required. */
  required?: boolean;
};

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

export type Input = BaseInput &
  (TextInput | NumberInput | SelectInput | RangeInput);
