import {
  BaseComponent,
  BaseYearly,
  Calculation,
  Component,
  InputValue,
  MonthPosition,
  Weekly,
} from "@/types/income";
import { Temporal } from "@js-temporal/polyfill";

export type CalculationWithDate = Calculation & {
  date: Temporal.PlainDate;
};

export interface ComponentResult {
  id: string;
  name: string;
  results: Array<{
    date: Temporal.PlainDate;
    amount: number;
  }>;
}

const resultsCache = new Map<Temporal.PlainDate, Map<string, number>>();
const cycleDetection = new Map<Temporal.PlainDate, Set<string>>();

export function calculate(
  components: Component[],
  inputValues: Record<string, Record<string, InputValue>>,
  startDate: Temporal.PlainDate,
  endDate: Temporal.PlainDate,
): ComponentResult[] {
  resultsCache.clear();
  cycleDetection.clear();

  const componentsByDate = new Map<
    Temporal.PlainDate,
    Array<BaseComponent & Calculation>
  >();
  const results: ComponentResult[] = [];

  for (const component of components) {
    // Prepare results array
    results.push({
      id: component.id,
      name: component.name,
      results: [],
    });

    // Resolve all periodic dates for the component
    const calculations = getCalculcationsForPeriod(
      component,
      startDate,
      endDate,
    );

    // Map the calculations by date
    for (const calculation of calculations) {
      if (!componentsByDate.has(calculation.date)) {
        componentsByDate.set(calculation.date, []);
      }
      componentsByDate.get(calculation.date)!.push({
        id: component.id,
        name: component.name,
        description: component.description,
        ...calculation,
      });
    }
  }

  // for each date, calculate the result of the components
  for (const [date, components] of componentsByDate) {
    for (const component of components) {
      // Caclulate the result for the component
      const result = calculateSingleDate(
        date,
        component,
        components,
        inputValues,
      );

      // Save the result
      const resultEntry = results.find((r) => r.id === component.id);
      if (resultEntry) {
        resultEntry.results.push({
          date: date,
          amount: result,
        });
      }
    }
  }

  return results;
}

/**
 * Calculates the result of the components for a single date
 * IMPORTANT: all components must have the same date!
 */
function calculateSingleDate(
  date: Temporal.PlainDate,
  component: BaseComponent & Calculation,
  componentsOnTheSameDate: Array<BaseComponent & Calculation>,
  inputValues: Record<string, Record<string, InputValue>>,
): number {
  // Check for cycles
  if (cycleDetection.has(date)) {
    if (cycleDetection.get(date)!.has(component.id)) {
      throw new Error(
        `Circular dependency detected for component "${component.id}" on date ${date.toString()}`,
      );
    }
  }

  // Return cached result if available
  if (resultsCache.has(date)) {
    const componentsOnThatDate = resultsCache.get(date);
    if (componentsOnThatDate?.has(component.id)) {
      return componentsOnThatDate.get(component.id)!;
    }
  }

  // Mark the component as visited for cycle detection
  if (!cycleDetection.has(date)) {
    cycleDetection.set(date, new Set());
  }
  cycleDetection.get(date)!.add(component.id);

  // Calculate all dependencies first
  const dependencyResults: Record<string, number> = {};
  for (const dependency of component.dependencies) {
    const dependencyComponent = componentsOnTheSameDate.find(
      (c) => c.id === dependency,
    );
    if (!dependencyComponent) {
      throw new Error(
        `Dependency "${dependency}" not found for component "${component.id}" for date "${date.toString()}"\nPlease check if a) the dependency exists and b) the dependency is valid for the given date`,
      );
    }
    const dependencyResult = calculateSingleDate(
      date,
      dependencyComponent,
      componentsOnTheSameDate,
      inputValues,
    );
    dependencyResults[dependency] = dependencyResult;
  }

  // Execute the calculation
  const result = executeCalculation(
    component.func,
    inputValues[component.id],
    dependencyResults,
  );

  // Cache the result
  if (!resultsCache.has(date)) {
    resultsCache.set(date, new Map());
  }
  resultsCache.get(date)!.set(component.id, result);

  // Remove the component from cycle detection
  cycleDetection.get(date)!.delete(component.id);

  return result;
}

export function executeCalculation(
  func: string,
  inputValues: Record<string, InputValue>,
  dependencyValues: Record<string, number>,
): number {
  const calc = new Function("inputs", "dependencies", func);
  return calc(inputValues, dependencyValues);
}

/**
 * Gets the calculations for a given period from a component
 * @param component The recurring or one-time component
 * @param startDate The start date of the period
 * @param endDate The end date of the period
 * @returns The calculations for the given period
 */
export function getCalculcationsForPeriod(
  component: Component,
  startDate: Temporal.PlainDate,
  endDate: Temporal.PlainDate,
): Array<CalculationWithDate> {
  if (component.type === "one-time") {
    if (isDateInPeriod(component.date, startDate, endDate)) {
      return [
        {
          ...component.calculation,
          date: component.date,
        },
      ];
    } else {
      return [];
    }
  } else {
    const calculations: Array<CalculationWithDate> = [];

    // For each calculation period, generate occurrences in [startDate, endDate]
    for (const calculationPeriod of component.calculationPeriods) {
      const period = calculationPeriod.period;

      // Skip if the recurring period does not overlap the given range
      if (
        !arePeriodsOverlapping(
          { startDate: period.startDate, endDate: period.endDate },
          { startDate, endDate },
        )
      ) {
        continue;
      }

      // Define the effective range as the overlap between the period and the provided range
      const { startDate: effectiveStart, endDate: effectiveEnd } =
        getOverlappingPeriod(
          { startDate: period.startDate, endDate: period.endDate },
          { startDate, endDate },
        )! as { startDate: Temporal.PlainDate; endDate: Temporal.PlainDate };

      // Generate occurrence dates based on frequency
      let occurrences: Array<Temporal.PlainDate>;
      switch (period.frequency) {
        case "daily": {
          occurrences = getDailyOccurrences(
            { startDate: effectiveStart, endDate: effectiveEnd },
            period.startDate,
            period.every,
          );
          break;
        }
        case "weekly": {
          occurrences = getWeeklyOccurrences(
            { startDate: effectiveStart, endDate: effectiveEnd },
            period.startDate,
            period.every,
            period.weekdays,
          );
          break;
        }
        case "monthly": {
          occurrences = getMonthlyOccurrences(
            { startDate: effectiveStart, endDate: effectiveEnd },
            period.startDate,
            period.every,
            period.dayOfMonthType === "day"
              ? { each: period.each }
              : {
                  day: period.day,
                  on: period.on,
                },
          );
          break;
        }
        case "yearly": {
          occurrences = getYearlyOccurrences(
            { startDate: effectiveStart, endDate: effectiveEnd },
            period.startDate,
            period.every,
            period.months,
            period.dayOfMonthType === "day"
              ? { each: period.each }
              : {
                  day: period.day,
                  on: period.on,
                },
          );
          break;
        }
        default: {
          occurrences = [];
          break;
        }
      }
      for (const occurrence of occurrences) {
        calculations.push({
          ...calculationPeriod.calculation,
          date: occurrence,
        });
      }
    }

    return calculations;
  }
}

export function isDateInPeriod(
  date: Temporal.PlainDate,
  startDate: Temporal.PlainDate,
  endDate?: Temporal.PlainDate,
): boolean {
  return (
    Temporal.PlainDate.compare(date, startDate) >= 0 &&
    (!endDate || Temporal.PlainDate.compare(date, endDate) <= 0)
  );
}

// An undefined endDate means going to infinity
export function arePeriodsOverlapping(
  period1: { startDate: Temporal.PlainDate; endDate?: Temporal.PlainDate },
  period2: { startDate: Temporal.PlainDate; endDate?: Temporal.PlainDate },
): boolean {
  // If either period has no end date (infinite), we only need to compare the start dates
  // with the other period's end date (if it exists)
  if (!period1.endDate && !period2.endDate) {
    // Both periods are infinite, they must overlap
    return true;
  }

  if (!period1.endDate) {
    // Period1 is infinite, it overlaps if it starts before or on period2's end
    // If period2 is also infinite, we already handled that case
    return period2.endDate
      ? Temporal.PlainDate.compare(period1.startDate, period2.endDate) <= 0
      : true;
  }

  if (!period2.endDate) {
    // Period2 is infinite, it overlaps if it starts before or on period1's end
    return Temporal.PlainDate.compare(period2.startDate, period1.endDate) <= 0;
  }

  // Both periods have start and end dates
  // They overlap if either:
  // 1. Period1 starts before or on Period2's end AND Period1 ends after or on Period2's start
  // 2. Period2 starts before or on Period1's end AND Period2 ends after or on Period1's start
  return (
    Temporal.PlainDate.compare(period1.startDate, period2.endDate) <= 0 &&
    Temporal.PlainDate.compare(period1.endDate, period2.startDate) >= 0
  );
}

// An undefined endDate means going to infinity
export function getOverlappingPeriod(
  period1: { startDate: Temporal.PlainDate; endDate?: Temporal.PlainDate },
  period2: { startDate: Temporal.PlainDate; endDate?: Temporal.PlainDate },
): { startDate: Temporal.PlainDate; endDate?: Temporal.PlainDate } | undefined {
  // If the periods are not overlapping, return null
  if (!arePeriodsOverlapping(period1, period2)) {
    return undefined;
  }

  // The start of the overlapping period is the newer startDate of both periods
  const start =
    Temporal.PlainDate.compare(period1.startDate, period2.startDate) > 0
      ? period1.startDate
      : period2.startDate;
  // If both endDates are present, the end of the overlapping period is the older endDate
  // Otherwise it is either the present endDate of one of the two periods or undefined if both are undefined
  const end =
    period1.endDate && period2.endDate
      ? Temporal.PlainDate.compare(period1.endDate, period2.endDate) < 0
        ? period1.endDate
        : period2.endDate
      : period1.endDate || period2.endDate;
  return { startDate: start, endDate: end };
}

const weekdayMap: Record<Weekly["weekdays"][number], number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
};

const monthMap: Record<BaseYearly["months"][number], number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

export function getDailyOccurrences(
  period: { startDate: Temporal.PlainDate; endDate: Temporal.PlainDate },
  anchorDay: Temporal.PlainDate,
  every: number,
): Temporal.PlainDate[] {
  const occurrences: Temporal.PlainDate[] = [];
  let current = anchorDay;
  while (Temporal.PlainDate.compare(current, period.endDate) <= 0) {
    if (Temporal.PlainDate.compare(current, period.startDate) >= 0) {
      occurrences.push(current);
    }
    current = current.add({ days: every });
  }
  return occurrences;
}

export function getWeeklyOccurrences(
  period: { startDate: Temporal.PlainDate; endDate: Temporal.PlainDate },
  anchorWeek: Temporal.PlainDate,
  every: number,
  weekdays: Weekly["weekdays"],
): Temporal.PlainDate[] {
  const occurrences: Temporal.PlainDate[] = [];
  // Set the current date to the first day of the week containing the anchor date
  const weekday = anchorWeek.dayOfWeek;
  const daysFromMonday = weekday - 1;
  let current = anchorWeek.subtract({ days: daysFromMonday });
  while (Temporal.PlainDate.compare(current, period.endDate) <= 0) {
    for (const weekday of weekdays) {
      const weekdayNumber = weekdayMap[weekday];
      const date = current.add({ days: weekdayNumber - 1 });
      if (
        Temporal.PlainDate.compare(date, period.startDate) >= 0 &&
        Temporal.PlainDate.compare(date, period.endDate) <= 0
      ) {
        occurrences.push(date);
      }
    }
    current = current.add({ weeks: every });
  }
  return occurrences;
}

function isWeekday(date: Temporal.PlainDate): boolean {
  return date.dayOfWeek >= 1 && date.dayOfWeek <= 5;
}

function matchesDayPosition(
  dayPosition: MonthPosition["day"],
  date: Temporal.PlainDate,
): boolean {
  switch (dayPosition) {
    case "monday":
      return date.dayOfWeek === 1;
    case "tuesday":
      return date.dayOfWeek === 2;
    case "wednesday":
      return date.dayOfWeek === 3;
    case "thursday":
      return date.dayOfWeek === 4;
    case "friday":
      return date.dayOfWeek === 5;
    case "saturday":
      return date.dayOfWeek === 6;
    case "sunday":
      return date.dayOfWeek === 7;
    case "day":
      return true;
    case "weekday":
      return isWeekday(date);
    case "weekend-day":
      return date.dayOfWeek === 6 || date.dayOfWeek === 7;
    default:
      return false;
  }
}

function getOccurrence(
  onPosition: MonthPosition["on"],
  matchingDays: Temporal.PlainDate[],
): Temporal.PlainDate | undefined {
  if (matchingDays.length === 0) return undefined;

  switch (onPosition) {
    case "first":
      return matchingDays[0];
    case "second":
      return matchingDays[1];
    case "third":
      return matchingDays[2];
    case "fourth":
      return matchingDays[3];
    case "fifth":
      return matchingDays[4];
    case "next-to-last":
      return matchingDays[matchingDays.length - 2];
    case "last":
      return matchingDays[matchingDays.length - 1];
    default:
      return undefined;
  }
}

export function getMonthlyOccurrences(
  period: { startDate: Temporal.PlainDate; endDate: Temporal.PlainDate },
  anchorMonth: Temporal.PlainDate,
  every: number,
  dayOfMonth:
    | { each: number }
    | { day: MonthPosition["day"]; on: MonthPosition["on"] },
): Temporal.PlainDate[] {
  const occurrences: Temporal.PlainDate[] = [];
  if ("each" in dayOfMonth) {
    let current = anchorMonth.with({ day: dayOfMonth.each });
    while (Temporal.PlainDate.compare(current, period.endDate) <= 0) {
      if (Temporal.PlainDate.compare(current, period.startDate) >= 0) {
        occurrences.push(current);
      }
      current = current.add({ months: every });
    }
  } else {
    let currentMonth = Temporal.PlainYearMonth.from(anchorMonth);
    const startMonth = Temporal.PlainYearMonth.from(period.startDate);
    const endMonth = Temporal.PlainYearMonth.from(period.endDate);

    // Adjust start point if anchor is before period start
    while (Temporal.PlainYearMonth.compare(currentMonth, startMonth) < 0) {
      currentMonth = currentMonth.add({ months: every });
    }

    // Generate occurrences
    while (Temporal.PlainYearMonth.compare(currentMonth, endMonth) <= 0) {
      const matchingDays: Temporal.PlainDate[] = [];
      const daysInMonth = currentMonth.daysInMonth;

      for (let day = 1; day <= daysInMonth; day++) {
        const date = currentMonth.toPlainDate({ day });
        if (matchesDayPosition(dayOfMonth.day, date)) {
          matchingDays.push(date);
        }
      }
      const occurrence = getOccurrence(dayOfMonth.on, matchingDays);

      if (
        occurrence &&
        Temporal.PlainDate.compare(occurrence, period.startDate) >= 0 &&
        Temporal.PlainDate.compare(occurrence, period.endDate) <= 0
      ) {
        occurrences.push(occurrence);
      }

      currentMonth = currentMonth.add({ months: every });
    }
  }
  return occurrences;
}

export function getYearlyOccurrences(
  period: { startDate: Temporal.PlainDate; endDate: Temporal.PlainDate },
  anchorYear: Temporal.PlainDate,
  every: number,
  months: BaseYearly["months"],
  dayOfMonth:
    | { each: number }
    | { day: MonthPosition["day"]; on: MonthPosition["on"] },
) {
  const occurrences: Temporal.PlainDate[] = [];
  if ("each" in dayOfMonth) {
    let currentYear = anchorYear.year;
    const startYear = period.startDate.year;
    const endYear = period.endDate.year;

    // Adjust start point if anchor is before period start
    while (currentYear < startYear) {
      currentYear = currentYear + every;
    }

    while (currentYear <= endYear) {
      for (const month of months) {
        const current = Temporal.PlainDate.from({
          day: dayOfMonth.each,
          month: monthMap[month],
          year: currentYear,
        });
        if (
          Temporal.PlainDate.compare(current, period.startDate) >= 0 &&
          Temporal.PlainDate.compare(current, period.endDate) <= 0
        ) {
          occurrences.push(current);
        }
      }
      currentYear = currentYear + every;
    }
  } else {
    let currentYear = anchorYear.year;
    const startYear = period.startDate.year;
    const endYear = period.endDate.year;

    // Adjust start point if anchor is before period start
    while (currentYear < startYear) {
      currentYear = currentYear + every;
    }

    // Generate occurrences
    while (currentYear <= endYear) {
      for (const month of months) {
        const matchingDays: Temporal.PlainDate[] = [];
        const currentYearMonth = Temporal.PlainYearMonth.from({
          year: currentYear,
          month: monthMap[month],
        });
        const daysInMonth = currentYearMonth.daysInMonth;

        for (let day = 1; day <= daysInMonth; day++) {
          const date = currentYearMonth.toPlainDate({ day });
          if (matchesDayPosition(dayOfMonth.day, date)) {
            matchingDays.push(date);
          }
        }
        const occurrence = getOccurrence(dayOfMonth.on, matchingDays);

        if (
          occurrence &&
          Temporal.PlainDate.compare(occurrence, period.startDate) >= 0 &&
          Temporal.PlainDate.compare(occurrence, period.endDate) <= 0
        ) {
          occurrences.push(occurrence);
        }
      }
      currentYear = currentYear + every;
    }
  }
  return occurrences;
}

export function laterPlainDate(
  date1: Temporal.PlainDate,
  date2: Temporal.PlainDate,
) {
  return Temporal.PlainDate.compare(date1, date2) > 0 ? date1 : date2;
}

export function earlierPlainDate(
  date1: Temporal.PlainDate,
  date2: Temporal.PlainDate,
) {
  return Temporal.PlainDate.compare(date1, date2) < 0 ? date1 : date2;
}
