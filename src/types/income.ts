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
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday"
  >;
};

type BaseMonthly = {
  frequency: "monthly";
  every: number;
};

type MonthDay = {
  dayOfMonthType: "day";
  each: number;
};

export type MonthPosition = {
  dayOfMonthType: "position";
  day:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday"
    | "day"
    | "weekday"
    | "weekend-day";
  on: "first" | "second" | "third" | "fourth" | "next-to-last" | "last";
};

export type Monthly = BaseMonthly & (MonthDay | MonthPosition);

type BaseYearly = {
  frequency: "yearly";
  every: number;
  months: Array<
    | "january"
    | "february"
    | "march"
    | "april"
    | "may"
    | "june"
    | "july"
    | "august"
    | "september"
    | "october"
    | "november"
    | "december"
  >;
};

type Yearly = BaseYearly & (MonthDay | MonthPosition);

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

type BooleanInput = {
  type: "boolean";
  defaultValue?: boolean;
};

type SelectInput = {
  type: "select";
  options: Array<{ id: string; label: string }>;
  defaultValue?: string;
};

type RangeInput = {
  type: "range";
  min: number;
  max: number;
  step: number;
  defaultValue: number;
};

export type Input = BaseInput &
  (TextInput | NumberInput | BooleanInput | SelectInput | RangeInput);

export type InputValue = string | number | boolean;

export type DependencyValue = InputValue;
