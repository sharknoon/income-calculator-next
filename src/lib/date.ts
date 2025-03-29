import { Temporal } from "@js-temporal/polyfill";
import { TZDate } from "react-day-picker";

export function plainDateToTZDate(plainDate: Temporal.PlainDate) {
  return new TZDate(plainDate.toString(), "UTC");
}

export function tzDateToPlainDate(tzDate: TZDate) {
  return Temporal.PlainDate.from(
    tzDate.withTimeZone("UTC").toISOString().substring(0, 10),
  );
}

export interface DatePeriod {
  startDate: Temporal.PlainDate;
  endDate?: Temporal.PlainDate;
}

/**
 * Merges overlapping date periods using Temporal.PlainDate
 * @param periods Array of date periods with startDate and endDate
 * @returns Array of merged date periods
 */
export function mergeDatePeriods(
  periods: Array<DatePeriod>,
): Array<DatePeriod> {
  // Return empty array if input is empty
  if (periods.length === 0) {
    return [];
  }

  // Deep clone the periods to avoid mutating the original array
  const clonedPeriods = JSON.parse(JSON.stringify(periods), (key, value) => {
    // Reconstruct the date object
    if ((key === "startDate" || key === "endDate") && value) {
      return Temporal.PlainDate.from(value);
    }
    return value;
  }) as DatePeriod[];

  // Create a copy and sort by startDate
  const sortedPeriods = clonedPeriods.sort((a, b) =>
    Temporal.PlainDate.compare(a.startDate, b.startDate),
  );

  // Initialize result with the first period
  const result: DatePeriod[] = [sortedPeriods[0]];

  // Iterate through the sorted periods and merge where applicable
  for (let i = 1; i < sortedPeriods.length; i++) {
    const currentPeriod = sortedPeriods[i];
    const lastMergedPeriod = result[result.length - 1];

    // If the last merged period has no end date, it extends forever
    // So it will encompass all subsequent periods
    if (lastMergedPeriod.endDate === undefined) {
      // The last merged period already extends indefinitely,
      // so no need to add the current period
      continue;
    }

    // Get the day after the last merged period's end date
    const dayAfterLastEnd = lastMergedPeriod.endDate.add({ days: 1 });

    // Check if current period overlaps or is adjacent to the last merged period
    if (
      Temporal.PlainDate.compare(
        currentPeriod.startDate,
        lastMergedPeriod.endDate,
      ) <= 0 ||
      Temporal.PlainDate.compare(currentPeriod.startDate, dayAfterLastEnd) === 0
    ) {
      // Periods overlap or are adjacent, merge them

      // If current period has no end date, the merged period extends indefinitely
      if (currentPeriod.endDate === undefined) {
        lastMergedPeriod.endDate = undefined;
      } else if (lastMergedPeriod.endDate !== undefined) {
        // Both have end dates, take the later one
        lastMergedPeriod.endDate =
          Temporal.PlainDate.compare(
            lastMergedPeriod.endDate,
            currentPeriod.endDate,
          ) >= 0
            ? lastMergedPeriod.endDate
            : currentPeriod.endDate;
      }
    } else {
      // Periods don't overlap, add the current period to result
      result.push({ ...currentPeriod });
    }
  }

  return result;
}
