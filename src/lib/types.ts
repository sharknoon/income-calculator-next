import { Temporal } from "@js-temporal/polyfill";

export type BaseComponent = {
  id: string;
  name: string;
  description: string;
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
  id: string;
  period: Period;
  calculation: Calculation;
};

export type Calculation = {
  inputs: Array<Input>;
  dependencies: Array<string>;
  func: string; // js code
};

export type BasePeriod = {
  startDate: Temporal.PlainDate;
  endDate?: Temporal.PlainDate; // Default is indefinite
};

export type Daily = {
  frequency: "daily";
  every: number;
};

export type Weekly = {
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

export type BaseMonthly = {
  frequency: "monthly";
  every: number;
};

export type MonthDay = {
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
  on:
    | "first"
    | "second"
    | "third"
    | "fourth"
    | "fifth"
    | "next-to-last"
    | "last";
};

export type Monthly = BaseMonthly & (MonthDay | MonthPosition);

export type BaseYearly = {
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

export type Yearly = BaseYearly & (MonthDay | MonthPosition);

export type Period = BasePeriod & (Daily | Weekly | Monthly | Yearly);

export type BaseInput = {
  id: string;
  name: string;
  description: string;
  /** Whether the input is required. `undefined` means required. */
  required: boolean;
};

export type TextInput = {
  type: "text";
  defaultValue: string;
  minLength: number;
  maxLength: number;
  placeholder: string;
};

export type NumberInput = {
  type: "number";
  defaultValue: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  placeholder: string;
};

export type BooleanInput = {
  type: "boolean";
  defaultValue: boolean;
};

export type SelectInput = {
  type: "select";
  options: Array<{ id: string; label: string }>;
  defaultValue: string;
};

export type RangeInput = {
  type: "range";
  min: number;
  max: number;
  step: number;
  defaultValue: number;
};

export type Input = BaseInput &
  (TextInput | NumberInput | BooleanInput | SelectInput | RangeInput);

export type InputValue = string | number | boolean;
