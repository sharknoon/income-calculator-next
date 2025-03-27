import { describe, it, expect } from "vitest";
import { Temporal } from "@js-temporal/polyfill";
import {
  calculate,
  isDateInPeriod,
  arePeriodsOverlapping,
  getOverlappingPeriod,
  getDailyOccurrences,
  getWeeklyOccurrences,
  getMonthlyOccurrences,
} from "@/lib/calculation";
import { Component, Weekly } from "@/types/income";

describe("calculate", () => {
  it("should calculate results for components with no dependencies and no inputs", () => {
    const components: Component[] = [
      {
        id: "one",
        name: "Component 1",
        type: "one-time",
        date: Temporal.PlainDate.from("2023-10-01"),
        calculation: {
          inputs: [],
          func: "return 100;",
          dependencies: [],
        },
      },
      {
        id: "two",
        name: "Component 2",
        type: "recurring",
        calculationPeriods: [
          {
            period: {
              startDate: Temporal.PlainDate.from("2023-01-01"),
              endDate: Temporal.PlainDate.from("2023-12-01"),
              frequency: "daily",
              every: 1,
            },
            calculation: {
              inputs: [],
              func: "return 200;",
              dependencies: [],
            },
          },
        ],
      },
    ];

    const date = Temporal.PlainYearMonth.from("2023-10");
    const results = calculate(components, date, {});

    expect(results).toEqual([
      { id: "one", name: "Component 1", amount: 100 },
      { id: "two", name: "Component 2", amount: 200 },
    ]);
  });

  it("should calculate results for components with dependencies and no inputs", () => {
    const components: Component[] = [
      {
        id: "one",
        name: "Component 1",
        type: "one-time",
        date: Temporal.PlainDate.from("2023-10-01"),
        calculation: {
          inputs: [],
          func: "return 100;",
          dependencies: [],
        },
      },
      {
        id: "two",
        name: "Component 2",
        type: "recurring",
        calculationPeriods: [
          {
            period: {
              startDate: Temporal.PlainDate.from("2023-01-01"),
              endDate: Temporal.PlainDate.from("2023-12-01"),
              frequency: "daily",
              every: 1,
            },
            calculation: {
              inputs: [],
              func: "return 2 * dependencies.one;",
              dependencies: ["one"],
            },
          },
        ],
      },
    ];

    const date = Temporal.PlainYearMonth.from("2023-10");
    const results = calculate(components, date, {});

    expect(results).toEqual([
      { id: "one", name: "Component 1", amount: 100 },
      { id: "two", name: "Component 2", amount: 200 },
    ]);
  });

  it("should throw an error for circular dependencies", () => {
    const components: Component[] = [
      {
        id: "one",
        name: "Component 1",
        type: "one-time",
        date: Temporal.PlainDate.from("2023-10-01"),
        calculation: {
          inputs: [],
          func: "return dependencies.two;",
          dependencies: ["two"],
        },
      },
      {
        id: "two",
        name: "Component 2",
        type: "recurring",
        calculationPeriods: [
          {
            period: {
              startDate: Temporal.PlainDate.from("2023-01-01"),
              endDate: Temporal.PlainDate.from("2023-12-01"),
              frequency: "daily",
              every: 1,
            },
            calculation: {
              inputs: [],
              func: "return dependencies.one;",
              dependencies: ["one"],
            },
          },
        ],
      },
    ];

    const date = Temporal.PlainYearMonth.from("2023-10");

    expect(() => calculate(components, date, {})).toThrow(
      "Circular dependency detected involving one",
    );
  });

  it("should handle components with no matching calculations for the given date", () => {
    const components: Component[] = [
      {
        id: "one",
        name: "Component 1",
        type: "one-time",
        date: Temporal.PlainDate.from("2023-09-01"),
        calculation: {
          inputs: [],
          func: "return 100;",
          dependencies: [],
        },
      },
      {
        id: "two",
        name: "Component 2",
        type: "recurring",
        calculationPeriods: [
          {
            period: {
              startDate: Temporal.PlainDate.from("2023-01-01"),
              endDate: Temporal.PlainDate.from("2023-09-01"),
              frequency: "daily",
              every: 1,
            },
            calculation: {
              inputs: [],
              func: "return 200;",
              dependencies: [],
            },
          },
        ],
      },
    ];

    const date = Temporal.PlainYearMonth.from("2023-10");
    const results = calculate(components, date, {});

    expect(results).toEqual([]);
  });

  it("should calculate results for components with no end date in recurring periods", () => {
    const components: Component[] = [
      {
        id: "one",
        name: "Component 1",
        type: "recurring",
        calculationPeriods: [
          {
            period: {
              startDate: Temporal.PlainDate.from("2023-01-01"),
              endDate: undefined,
              frequency: "daily",
              every: 1,
            },
            calculation: {
              inputs: [],
              func: "return 300;",
              dependencies: [],
            },
          },
        ],
      },
    ];

    const date = Temporal.PlainYearMonth.from("2024-01");
    const results = calculate(components, date, {});

    expect(results).toEqual([{ id: "one", name: "Component 1", amount: 300 }]);
  });

  it("should calculate results for components with dependencies and inputs", () => {
    const components: Component[] = [
      {
        id: "one",
        name: "Component 1",
        type: "one-time",
        date: Temporal.PlainDate.from("2023-10-01"),
        calculation: {
          inputs: [],
          func: "return 100;",
          dependencies: [],
        },
      },
      {
        id: "two",
        name: "Component 2",
        type: "recurring",
        calculationPeriods: [
          {
            period: {
              startDate: Temporal.PlainDate.from("2023-01-01"),
              endDate: Temporal.PlainDate.from("2023-12-01"),
              frequency: "daily",
              every: 1,
            },
            calculation: {
              inputs: [
                {
                  id: "one",
                  name: "Input 1",
                  type: "number",
                },
              ],
              func: "return inputs.one * dependencies.one;",
              dependencies: ["one"],
            },
          },
        ],
      },
    ];

    const date = Temporal.PlainYearMonth.from("2023-10");
    const results = calculate(components, date, { two: { one: 2 } });

    expect(results).toEqual([
      { id: "one", name: "Component 1", amount: 100 },
      { id: "two", name: "Component 2", amount: 200 },
    ]);
  });
});

describe("isDateInPeriod", () => {
  it("should return true when the date is within the period", () => {
    const date = Temporal.PlainDate.from("2023-06-15");
    const startDate = Temporal.PlainDate.from("2023-01-01");
    const endDate = Temporal.PlainDate.from("2023-12-31");

    const result = isDateInPeriod(date, startDate, endDate);

    expect(result).toBe(true);
  });

  it("should return true when the date is equal to the start date", () => {
    const date = Temporal.PlainDate.from("2023-01-01");
    const startDate = Temporal.PlainDate.from("2023-01-01");
    const endDate = Temporal.PlainDate.from("2023-12-31");

    const result = isDateInPeriod(date, startDate, endDate);

    expect(result).toBe(true);
  });

  it("should return true when the date is equal to the end date", () => {
    const date = Temporal.PlainDate.from("2023-12-31");
    const startDate = Temporal.PlainDate.from("2023-01-01");
    const endDate = Temporal.PlainDate.from("2023-12-31");

    const result = isDateInPeriod(date, startDate, endDate);

    expect(result).toBe(true);
  });

  it("should return false when the date is before the start date", () => {
    const date = Temporal.PlainDate.from("2022-12-31");
    const startDate = Temporal.PlainDate.from("2023-01-01");
    const endDate = Temporal.PlainDate.from("2023-12-31");

    const result = isDateInPeriod(date, startDate, endDate);

    expect(result).toBe(false);
  });

  it("should return false when the date is after the end date", () => {
    const date = Temporal.PlainDate.from("2024-01-01");
    const startDate = Temporal.PlainDate.from("2023-01-01");
    const endDate = Temporal.PlainDate.from("2023-12-31");

    const result = isDateInPeriod(date, startDate, endDate);

    expect(result).toBe(false);
  });

  it("should return true when the end date is undefined and the date is after the start date", () => {
    const date = Temporal.PlainDate.from("2024-01-01");
    const startDate = Temporal.PlainDate.from("2023-01-01");

    const result = isDateInPeriod(date, startDate);

    expect(result).toBe(true);
  });

  it("should return false when the end date is undefined and the date is before the start date", () => {
    const date = Temporal.PlainDate.from("2022-12-31");
    const startDate = Temporal.PlainDate.from("2023-01-01");

    const result = isDateInPeriod(date, startDate);

    expect(result).toBe(false);
  });
});

describe("arePeriodsOverlapping", () => {
  it("should return true when both periods are infinite", () => {
    const period1 = { startDate: Temporal.PlainDate.from("2023-01-01") };
    const period2 = { startDate: Temporal.PlainDate.from("2024-01-01") };

    const result = arePeriodsOverlapping(period1, period2);

    expect(result).toBe(true);
  });

  it("should return true when period1 is infinite and overlaps with period2", () => {
    const period1 = { startDate: Temporal.PlainDate.from("2023-01-01") };
    const period2 = {
      startDate: Temporal.PlainDate.from("2024-01-01"),
      endDate: Temporal.PlainDate.from("2025-01-01"),
    };

    const result = arePeriodsOverlapping(period1, period2);

    expect(result).toBe(true);
  });

  it("should return true when period2 is infinite and overlaps with period1", () => {
    const period1 = {
      startDate: Temporal.PlainDate.from("2023-01-01"),
      endDate: Temporal.PlainDate.from("2024-01-01"),
    };
    const period2 = { startDate: Temporal.PlainDate.from("2023-06-01") };

    const result = arePeriodsOverlapping(period1, period2);

    expect(result).toBe(true);
  });

  it("should return true when both periods have start and end dates and overlap", () => {
    const period1 = {
      startDate: Temporal.PlainDate.from("2023-01-01"),
      endDate: Temporal.PlainDate.from("2023-06-01"),
    };
    const period2 = {
      startDate: Temporal.PlainDate.from("2023-05-01"),
      endDate: Temporal.PlainDate.from("2023-12-01"),
    };

    const result = arePeriodsOverlapping(period1, period2);

    expect(result).toBe(true);
  });

  it("should return false when both periods have start and end dates and do not overlap", () => {
    const period1 = {
      startDate: Temporal.PlainDate.from("2023-01-01"),
      endDate: Temporal.PlainDate.from("2023-06-01"),
    };
    const period2 = {
      startDate: Temporal.PlainDate.from("2023-07-01"),
      endDate: Temporal.PlainDate.from("2023-12-01"),
    };

    const result = arePeriodsOverlapping(period1, period2);

    expect(result).toBe(false);
  });

  it("should return true when period1 ends on the same day period2 starts", () => {
    const period1 = {
      startDate: Temporal.PlainDate.from("2023-01-01"),
      endDate: Temporal.PlainDate.from("2023-06-01"),
    };
    const period2 = {
      startDate: Temporal.PlainDate.from("2023-06-01"),
      endDate: Temporal.PlainDate.from("2023-12-01"),
    };

    const result = arePeriodsOverlapping(period1, period2);

    expect(result).toBe(true);
  });

  it("should return true when period2 ends on the same day period1 starts", () => {
    const period1 = {
      startDate: Temporal.PlainDate.from("2023-06-01"),
      endDate: Temporal.PlainDate.from("2023-12-01"),
    };
    const period2 = {
      startDate: Temporal.PlainDate.from("2023-01-01"),
      endDate: Temporal.PlainDate.from("2023-06-01"),
    };

    const result = arePeriodsOverlapping(period1, period2);

    expect(result).toBe(true);
  });

  it("should return false when period1 is infinite but starts after period2 ends", () => {
    const period1 = { startDate: Temporal.PlainDate.from("2024-01-01") };
    const period2 = {
      startDate: Temporal.PlainDate.from("2023-01-01"),
      endDate: Temporal.PlainDate.from("2023-12-31"),
    };

    const result = arePeriodsOverlapping(period1, period2);

    expect(result).toBe(false);
  });

  it("should return false when period2 is infinite but starts after period1 ends", () => {
    const period1 = {
      startDate: Temporal.PlainDate.from("2023-01-01"),
      endDate: Temporal.PlainDate.from("2023-12-31"),
    };
    const period2 = { startDate: Temporal.PlainDate.from("2024-01-01") };

    const result = arePeriodsOverlapping(period1, period2);

    expect(result).toBe(false);
  });
});

describe("getOverlappingPeriod", () => {
  it("should return null when periods do not overlap", () => {
    const period1 = {
      startDate: Temporal.PlainDate.from("2023-01-01"),
      endDate: Temporal.PlainDate.from("2023-06-01"),
    };
    const period2 = {
      startDate: Temporal.PlainDate.from("2023-07-01"),
      endDate: Temporal.PlainDate.from("2023-12-01"),
    };

    const result = getOverlappingPeriod(period1, period2);

    expect(result).toBeUndefined();
  });

  it("should return overlapping period when both periods have finite bounds", () => {
    const period1 = {
      startDate: Temporal.PlainDate.from("2023-01-01"),
      endDate: Temporal.PlainDate.from("2023-06-01"),
    };
    const period2 = {
      startDate: Temporal.PlainDate.from("2023-05-01"),
      endDate: Temporal.PlainDate.from("2023-12-01"),
    };

    const result = getOverlappingPeriod(period1, period2);

    expect(result).toEqual({
      startDate: Temporal.PlainDate.from("2023-05-01"),
      endDate: Temporal.PlainDate.from("2023-06-01"),
    });
  });

  it("should return overlapping period when period1 is infinite", () => {
    const period1 = {
      startDate: Temporal.PlainDate.from("2023-05-01"),
    };
    const period2 = {
      startDate: Temporal.PlainDate.from("2023-01-01"),
      endDate: Temporal.PlainDate.from("2023-12-01"),
    };

    const result = getOverlappingPeriod(period1, period2);

    expect(result).toEqual({
      startDate: Temporal.PlainDate.from("2023-05-01"),
      endDate: Temporal.PlainDate.from("2023-12-01"),
    });
  });

  it("should return overlapping period when period2 is infinite", () => {
    const period1 = {
      startDate: Temporal.PlainDate.from("2023-01-01"),
      endDate: Temporal.PlainDate.from("2023-12-01"),
    };
    const period2 = {
      startDate: Temporal.PlainDate.from("2023-05-01"),
    };

    const result = getOverlappingPeriod(period1, period2);

    expect(result).toEqual({
      startDate: Temporal.PlainDate.from("2023-05-01"),
      endDate: Temporal.PlainDate.from("2023-12-01"),
    });
  });

  it("should return overlapping period when both periods are infinite", () => {
    const period1 = {
      startDate: Temporal.PlainDate.from("2023-01-01"),
    };
    const period2 = {
      startDate: Temporal.PlainDate.from("2023-05-01"),
    };

    const result = getOverlappingPeriod(period1, period2);

    expect(result).toEqual({
      startDate: Temporal.PlainDate.from("2023-05-01"),
      endDate: undefined,
    });
  });

  it("should return overlapping period when periods share exact bounds", () => {
    const period1 = {
      startDate: Temporal.PlainDate.from("2023-01-01"),
      endDate: Temporal.PlainDate.from("2023-12-31"),
    };
    const period2 = {
      startDate: Temporal.PlainDate.from("2023-01-01"),
      endDate: Temporal.PlainDate.from("2023-12-31"),
    };

    const result = getOverlappingPeriod(period1, period2);

    expect(result).toEqual({
      startDate: Temporal.PlainDate.from("2023-01-01"),
      endDate: Temporal.PlainDate.from("2023-12-31"),
    });
  });
});

describe("getDailyOccurrences", () => {
  it("should return daily occurrences within the period starting from the anchor date", () => {
    const period = {
      startDate: Temporal.PlainDate.from("2023-01-01"),
      endDate: Temporal.PlainDate.from("2023-01-05"),
    };
    const anchor = Temporal.PlainDate.from("2023-01-01");
    const every = 1;

    const result = getDailyOccurrences(period, anchor, every);

    expect(result).toEqual([
      Temporal.PlainDate.from("2023-01-01"),
      Temporal.PlainDate.from("2023-01-02"),
      Temporal.PlainDate.from("2023-01-03"),
      Temporal.PlainDate.from("2023-01-04"),
      Temporal.PlainDate.from("2023-01-05"),
    ]);
  });

  it("should skip dates before the start date of the period", () => {
    const period = {
      startDate: Temporal.PlainDate.from("2023-01-03"),
      endDate: Temporal.PlainDate.from("2023-01-05"),
    };
    const anchor = Temporal.PlainDate.from("2023-01-01");
    const every = 1;

    const result = getDailyOccurrences(period, anchor, every);

    expect(result).toEqual([
      Temporal.PlainDate.from("2023-01-03"),
      Temporal.PlainDate.from("2023-01-04"),
      Temporal.PlainDate.from("2023-01-05"),
    ]);
  });

  it("should return an empty array if the anchor date is after the period end date", () => {
    const period = {
      startDate: Temporal.PlainDate.from("2023-01-01"),
      endDate: Temporal.PlainDate.from("2023-01-05"),
    };
    const anchor = Temporal.PlainDate.from("2023-01-06");
    const every = 1;

    const result = getDailyOccurrences(period, anchor, every);

    expect(result).toEqual([]);
  });

  it("should return occurrences with a step of 'every' days", () => {
    const period = {
      startDate: Temporal.PlainDate.from("2023-01-01"),
      endDate: Temporal.PlainDate.from("2023-01-10"),
    };
    const anchor = Temporal.PlainDate.from("2023-01-01");
    const every = 2;

    const result = getDailyOccurrences(period, anchor, every);

    expect(result).toEqual([
      Temporal.PlainDate.from("2023-01-01"),
      Temporal.PlainDate.from("2023-01-03"),
      Temporal.PlainDate.from("2023-01-05"),
      Temporal.PlainDate.from("2023-01-07"),
      Temporal.PlainDate.from("2023-01-09"),
    ]);
  });

  it("should adjust the anchor date to the first valid occurrence within the period", () => {
    const period = {
      startDate: Temporal.PlainDate.from("2023-01-03"),
      endDate: Temporal.PlainDate.from("2023-01-10"),
    };
    const anchor = Temporal.PlainDate.from("2023-01-01");
    const every = 3;

    const result = getDailyOccurrences(period, anchor, every);

    expect(result).toEqual([
      Temporal.PlainDate.from("2023-01-04"),
      Temporal.PlainDate.from("2023-01-07"),
      Temporal.PlainDate.from("2023-01-10"),
    ]);
  });

  it("should return an empty array if the period start date is after the period end date", () => {
    const period = {
      startDate: Temporal.PlainDate.from("2023-01-10"),
      endDate: Temporal.PlainDate.from("2023-01-05"),
    };
    const anchor = Temporal.PlainDate.from("2023-01-01");
    const every = 1;

    const result = getDailyOccurrences(period, anchor, every);

    expect(result).toEqual([]);
  });
});

describe("getWeeklyOccurrences", () => {
  it("should return weekly occurrences within the period for specified weekdays", () => {
    const period = {
      startDate: Temporal.PlainDate.from("2023-01-01"),
      endDate: Temporal.PlainDate.from("2023-01-31"),
    };
    const anchor = Temporal.PlainDate.from("2023-01-01");
    const every = 1;
    const weekdays: Weekly["weekdays"] = ["monday", "wednesday", "friday"];

    const result = getWeeklyOccurrences(period, anchor, every, weekdays);

    expect(result).toEqual([
      Temporal.PlainDate.from("2023-01-02"),
      Temporal.PlainDate.from("2023-01-04"),
      Temporal.PlainDate.from("2023-01-06"),
      Temporal.PlainDate.from("2023-01-09"),
      Temporal.PlainDate.from("2023-01-11"),
      Temporal.PlainDate.from("2023-01-13"),
      Temporal.PlainDate.from("2023-01-16"),
      Temporal.PlainDate.from("2023-01-18"),
      Temporal.PlainDate.from("2023-01-20"),
      Temporal.PlainDate.from("2023-01-23"),
      Temporal.PlainDate.from("2023-01-25"),
      Temporal.PlainDate.from("2023-01-27"),
      Temporal.PlainDate.from("2023-01-30"),
    ]);
  });

  it("should skip dates before the start date of the period", () => {
    const period = {
      startDate: Temporal.PlainDate.from("2023-01-10"),
      endDate: Temporal.PlainDate.from("2023-01-31"),
    };
    const anchor = Temporal.PlainDate.from("2023-01-01");
    const every = 1;
    const weekdays: Weekly["weekdays"] = ["monday", "wednesday", "friday"];

    const result = getWeeklyOccurrences(period, anchor, every, weekdays);

    expect(result).toEqual([
      Temporal.PlainDate.from("2023-01-11"),
      Temporal.PlainDate.from("2023-01-13"),
      Temporal.PlainDate.from("2023-01-16"),
      Temporal.PlainDate.from("2023-01-18"),
      Temporal.PlainDate.from("2023-01-20"),
      Temporal.PlainDate.from("2023-01-23"),
      Temporal.PlainDate.from("2023-01-25"),
      Temporal.PlainDate.from("2023-01-27"),
      Temporal.PlainDate.from("2023-01-30"),
    ]);
  });

  it("should return an empty array if the anchor date is after the period end date", () => {
    const period = {
      startDate: Temporal.PlainDate.from("2023-01-01"),
      endDate: Temporal.PlainDate.from("2023-01-31"),
    };
    const anchor = Temporal.PlainDate.from("2023-02-06");
    const every = 1;
    const weekdays: Weekly["weekdays"] = ["monday", "wednesday", "friday"];

    const result = getWeeklyOccurrences(period, anchor, every, weekdays);

    expect(result).toEqual([]);
  });

  it("should return occurrences with a step of 'every' weeks", () => {
    const period = {
      startDate: Temporal.PlainDate.from("2023-01-01"),
      endDate: Temporal.PlainDate.from("2023-01-31"),
    };
    const anchor = Temporal.PlainDate.from("2023-01-01");
    const every = 2;
    const weekdays: Weekly["weekdays"] = ["monday", "wednesday", "friday"];

    const result = getWeeklyOccurrences(period, anchor, every, weekdays);

    expect(result).toEqual([
      Temporal.PlainDate.from("2023-01-09"),
      Temporal.PlainDate.from("2023-01-11"),
      Temporal.PlainDate.from("2023-01-13"),
      Temporal.PlainDate.from("2023-01-23"),
      Temporal.PlainDate.from("2023-01-25"),
      Temporal.PlainDate.from("2023-01-27"),
    ]);
  });

  it("should return an empty array if the period start date is after the period end date", () => {
    const period = {
      startDate: Temporal.PlainDate.from("2023-01-31"),
      endDate: Temporal.PlainDate.from("2023-01-01"),
    };
    const anchor = Temporal.PlainDate.from("2023-01-01");
    const every = 1;
    const weekdays: Weekly["weekdays"] = ["monday", "wednesday", "friday"];

    const result = getWeeklyOccurrences(period, anchor, every, weekdays);

    expect(result).toEqual([]);
  });
});

describe("getMonthlyOccurrences", () => {
  it("should return monthly occurrences on a specific day of the month", () => {
    const period = {
      startDate: Temporal.PlainDate.from("2023-01-01"),
      endDate: Temporal.PlainDate.from("2023-06-30"),
    };
    const anchorMonth = Temporal.PlainDate.from("2023-01-01");
    const every = 1;
    const dayOfMonth = { each: 15 };

    const result = getMonthlyOccurrences(
      period,
      anchorMonth,
      every,
      dayOfMonth,
    );

    expect(result).toEqual([
      Temporal.PlainDate.from("2023-01-15"),
      Temporal.PlainDate.from("2023-02-15"),
      Temporal.PlainDate.from("2023-03-15"),
      Temporal.PlainDate.from("2023-04-15"),
      Temporal.PlainDate.from("2023-05-15"),
      Temporal.PlainDate.from("2023-06-15"),
    ]);
  });

  it("should skip months before the start date of the period", () => {
    const period = {
      startDate: Temporal.PlainDate.from("2023-03-01"),
      endDate: Temporal.PlainDate.from("2023-06-30"),
    };
    const anchorMonth = Temporal.PlainDate.from("2023-01-01");
    const every = 1;
    const dayOfMonth = { each: 15 };

    const result = getMonthlyOccurrences(
      period,
      anchorMonth,
      every,
      dayOfMonth,
    );

    expect(result).toEqual([
      Temporal.PlainDate.from("2023-03-15"),
      Temporal.PlainDate.from("2023-04-15"),
      Temporal.PlainDate.from("2023-05-15"),
      Temporal.PlainDate.from("2023-06-15"),
    ]);
  });

  it("should return occurrences with a step of 'every' months", () => {
    const period = {
      startDate: Temporal.PlainDate.from("2023-01-01"),
      endDate: Temporal.PlainDate.from("2023-12-31"),
    };
    const anchorMonth = Temporal.PlainDate.from("2023-01-01");
    const every = 2;
    const dayOfMonth = { each: 15 };

    const result = getMonthlyOccurrences(
      period,
      anchorMonth,
      every,
      dayOfMonth,
    );

    expect(result).toEqual([
      Temporal.PlainDate.from("2023-01-15"),
      Temporal.PlainDate.from("2023-03-15"),
      Temporal.PlainDate.from("2023-05-15"),
      Temporal.PlainDate.from("2023-07-15"),
      Temporal.PlainDate.from("2023-09-15"),
      Temporal.PlainDate.from("2023-11-15"),
    ]);
  });

  it("should return occurrences based on day position within the month", () => {
    const period = {
      startDate: Temporal.PlainDate.from("2023-01-01"),
      endDate: Temporal.PlainDate.from("2023-06-30"),
    };
    const anchorMonth = Temporal.PlainDate.from("2023-01-01");
    const every = 1;
    const dayOfMonth: { day: "monday"; on: "first" } = {
      day: "monday",
      on: "first",
    };

    const result = getMonthlyOccurrences(
      period,
      anchorMonth,
      every,
      dayOfMonth,
    );

    expect(result).toEqual([
      Temporal.PlainDate.from("2023-01-02"),
      Temporal.PlainDate.from("2023-02-06"),
      Temporal.PlainDate.from("2023-03-06"),
      Temporal.PlainDate.from("2023-04-03"),
      Temporal.PlainDate.from("2023-05-01"),
      Temporal.PlainDate.from("2023-06-05"),
    ]);
  });

  it("should skip months where no matching day exists", () => {
    const period = {
      startDate: Temporal.PlainDate.from("2023-01-01"),
      endDate: Temporal.PlainDate.from("2023-06-30"),
    };
    const anchorMonth = Temporal.PlainDate.from("2023-01-01");
    const every = 1;
    const dayOfMonth: { day: "sunday"; on: "fifth" } = {
      day: "sunday",
      on: "fifth",
    };

    const result = getMonthlyOccurrences(
      period,
      anchorMonth,
      every,
      dayOfMonth,
    );

    expect(result).toEqual([
      Temporal.PlainDate.from("2023-01-29"),
      Temporal.PlainDate.from("2023-04-30"),
    ]);
  });

  it("should return an empty array if the period start date is after the period end date", () => {
    const period = {
      startDate: Temporal.PlainDate.from("2023-06-30"),
      endDate: Temporal.PlainDate.from("2023-01-01"),
    };
    const anchorMonth = Temporal.PlainDate.from("2023-01-01");
    const every = 1;
    const dayOfMonth = { each: 15 };

    const result = getMonthlyOccurrences(
      period,
      anchorMonth,
      every,
      dayOfMonth,
    );

    expect(result).toEqual([]);
  });

  it("should handle months with fewer days than the specified day", () => {
    const period = {
      startDate: Temporal.PlainDate.from("2023-01-01"),
      endDate: Temporal.PlainDate.from("2023-03-31"),
    };
    const anchorMonth = Temporal.PlainDate.from("2023-01-01");
    const every = 1;
    const dayOfMonth = { each: 31 };

    const result = getMonthlyOccurrences(
      period,
      anchorMonth,
      every,
      dayOfMonth,
    );

    expect(result).toEqual([
      Temporal.PlainDate.from("2023-01-31"),
      Temporal.PlainDate.from("2023-02-28"),
      Temporal.PlainDate.from("2023-03-28"),
    ]);
  });
});
