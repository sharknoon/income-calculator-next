import {
  BaseYearly,
  Calculation,
  Component,
  InputValue,
  MonthPosition,
  Weekly,
} from "@/types/income";
import { Temporal } from "@js-temporal/polyfill";

export interface ComponentCalculation {
  id: string;
  name: string;
  calculations: Array<{
    date: Temporal.PlainDate;
    calculation: Calculation;
  }>;
}

export interface ComponentResult {
  id: string;
  name: string;
  results: Array<{
    date: Temporal.PlainDate;
    amount: number;
  }>;
}

export function calculate(
  components: Component[],
  inputValues: Record<string, Record<string, InputValue>>,
  startDate: Temporal.PlainDate,
  endDate: Temporal.PlainDate,
): ComponentResult[] {
  // Get all component calculations that match the given date
  const componentCalculations: Array<ComponentCalculation> = [];
  for (const component of components) {
    const calculations = getCalculcationsForDate(component, startDate, endDate);
    componentCalculations.push(...calculations);
  }

  // Store calculated results for reuse
  const calculated = new Map<string, number>();

  // Track visited nodes for cycle detection
  const visitedAfterCalculation = new Set<string>();
  const visitedBeforeCalculation = new Set<string>();

  // Create adjacency map for easier dependency lookup
  const dependencyMap = new Map<string, ComponentCalculation>();
  componentCalculations.forEach((item) => dependencyMap.set(item.id, item));

  // Result array
  const results: ComponentResult[] = [];

  function calculateComponent(component: ComponentCalculation): number {
    // Check for cycles
    if (visitedBeforeCalculation.has(component.id)) {
      throw new Error(`Circular dependency detected involving ${component.id}`);
    }

    // Return cached result if available
    if (calculated.has(component.id)) {
      return calculated.get(component.id)!;
    }

    // Mark as being visited for cycle detection
    visitedBeforeCalculation.add(component.id);

    // Calculate all dependencies first
    const depValues = new Map<string, number>();
    for (const depId of component.calculation.dependencies) {
      const dependency = dependencyMap.get(depId);
      if (!dependency) {
        throw new Error(`Component with id ${depId} not found`);
      }
      depValues.set(depId, calculateComponent(dependency));
    }

    // Create dependency context with dependency values
    const dependenciesContext: Record<string, number> = {};
    depValues.forEach((value, depId) => {
      dependenciesContext[depId] = value;
    });

    // Create input context with input values
    const inputContext: Record<string, InputValue> = {};
    const inputValuesOfComponent = inputValues[component.id] || {};
    Object.keys(inputValuesOfComponent).forEach((inputId) => {
      inputContext[inputId] = inputValuesOfComponent[inputId];
    });

    // Execute the function string with the context
    try {
      const func = new Function(
        "dependencies",
        "inputs",
        component.calculation.func,
      );
      const result = func(dependenciesContext, inputContext);

      // Cache the result
      calculated.set(component.id, result);

      // Remove from temp visited as we're done with this node
      visitedBeforeCalculation.delete(component.id);

      // Add to visited
      visitedAfterCalculation.add(component.id);

      // Add to results if not already added
      if (!results.some((r) => r.id === component.id)) {
        results.push({
          id: component.id,
          name: component.name,
          amount: result,
        });
      }

      return result;
    } catch (error) {
      throw new Error(
        `Error evaluating function for ${component.id}: ${error}`,
      );
    }
  }

  // Process all items
  for (const component of componentCalculations) {
    if (!visitedAfterCalculation.has(component.id)) {
      calculateComponent(component);
    }
  }

  return results;
}

/**
 * Gets the calculations for a given period from a component
 * @param component The recurring or one-time component
 * @param startDate The start date of the period
 * @param endDate The end date of the period
 * @returns The calculations for the given period
 */
export function getCalculcationsForDate(
  component: Component,
  startDate: Temporal.PlainDate,
  endDate: Temporal.PlainDate,
): ComponentCalculation {
  if (component.type === "one-time") {
    if (isDateInPeriod(component.date, startDate, endDate)) {
      return {
        id: component.id,
        name: component.name,
        calculations: [
          {
            date: component.date,
            calculation: component.calculation,
          },
        ],
      };
    } else {
      return {
        id: component.id,
        name: component.name,
        calculations: [],
      };
    }
  } else {
    const calculations: Array<{
      date: Temporal.PlainDate;
      calculation: Calculation;
    }> = [];

    // For each calculation period, generate occurrences in [startDate, endDate]
    for (const periodCalc of component.calculationPeriods) {
      const period = periodCalc.period;

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
          // Simplified handling for Yearly frequency with MonthDay variant.
          if ("each" in period) {
            const monthsMap: Record<string, number> = {
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
            for (
              let year = effectiveStart.year;
              year <= effectiveEnd.year;
              year++
            ) {
              for (const monthName of period.months) {
                const month = monthsMap[monthName];
                try {
                  const occurrence = Temporal.PlainDate.from({
                    year,
                    month,
                    day: period.each,
                  });
                  if (
                    Temporal.PlainDate.compare(occurrence, effectiveStart) >=
                      0 &&
                    Temporal.PlainDate.compare(occurrence, effectiveEnd) <= 0
                  ) {
                    calculations.push({
                      date: occurrence,
                      calculation: periodCalc.calculation,
                    });
                  }
                } catch (e) {
                  // Invalid date (e.g. February 30); skip this occurrence.
                }
              }
            }
          }
          // TODO: Implement MonthPosition variant for yearly frequency.
          break;
        }
        default: {
          // Unsupported frequency; could log a warning here.
          break;
        }
      }
      for (const occurrence of occurrences) {
        calculations.push({
          date: occurrence,
          calculation: periodCalc.calculation,
        });
      }
    }

    return {
      id: component.id,
      name: component.name,
      calculations,
    };
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
    for (const month of months) {
      let current = Temporal.PlainDate.from({
        day: dayOfMonth.each,
        month: monthMap[month],
        year: currentYear,
      });
      while (Temporal.PlainDate.compare(current, period.endDate) <= 0) {
        if (Temporal.PlainDate.compare(current, period.startDate) >= 0) {
          occurrences.push(current);
        }
      }
    }
    currentYear = currentYear + every;
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
