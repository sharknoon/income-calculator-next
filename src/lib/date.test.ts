import { tzDateToPlainDate, mergeDatePeriods, plainDateToTZDate } from "./date";
import { Temporal } from "@js-temporal/polyfill";
import { TZDate } from "react-day-picker";
import { describe, expect, it } from "vitest";

describe("plainDateToJsDate", () => {
  it("should convert a Temporal.PlainDate to a JavaScript Date", () => {
    const plainDate = Temporal.PlainDate.from("2023-03-15");
    const jsDate = plainDateToTZDate(plainDate);

    expect(jsDate).toBeInstanceOf(Date);
    expect(jsDate.toISOString().startsWith("2023-03-15")).toBe(true);
  });

  it("should handle leap years correctly", () => {
    const plainDate = Temporal.PlainDate.from("2024-02-29");
    const jsDate = plainDateToTZDate(plainDate);

    expect(jsDate).toBeInstanceOf(Date);
    expect(jsDate.toISOString().startsWith("2024-02-29")).toBe(true);
  });

  it("should handle invalid Temporal.PlainDate inputs gracefully", () => {
    expect(() => {
      // @ts-expect-error: Testing invalid input
      plainDateToTZDate(null);
    }).toThrow();

    expect(() => {
      // @ts-expect-error: Testing invalid input
      plainDateToTZDate(undefined);
    }).toThrow();
  });
});

describe("jsDateToPlainDate", () => {
  it("should convert a JavaScript Date (with timezone) to a Temporal.PlainDate", () => {
    const tzDate = new TZDate("2023-03-15T00:00:00Z");
    const plainDate = tzDateToPlainDate(tzDate);

    expect(plainDate).toBeInstanceOf(Temporal.PlainDate);
    expect(plainDate.toString()).toBe("2023-03-15");
  });

  it("should handle leap years correctly", () => {
    const tzDate = new TZDate("2024-02-29T00:00:00Z");
    const plainDate = tzDateToPlainDate(tzDate);

    expect(plainDate).toBeInstanceOf(Temporal.PlainDate);
    expect(plainDate.toString()).toBe("2024-02-29");
  });

  it("should handle dates around midnight correctly", () => {
    const tzDate = new TZDate("2023-03-15T23:59:59Z");
    const plainDate = tzDateToPlainDate(tzDate);

    expect(plainDate).toBeInstanceOf(Temporal.PlainDate);
    expect(plainDate.toString()).toBe("2023-03-15");
  });

  it("should handle invalid JavaScript Date inputs gracefully", () => {
    expect(() => {
      // @ts-expect-error: Testing invalid input
      tzDateToPlainDate(null);
    }).toThrow();

    expect(() => {
      // @ts-expect-error: Testing invalid input
      tzDateToPlainDate(undefined);
    }).toThrow();

    expect(() => {
      tzDateToPlainDate(new TZDate("invalid-date"));
    }).toThrow();
  });
});

describe("mergeDatePeriods", () => {
  it("should return an empty array when input is empty", () => {
    const result = mergeDatePeriods([]);
    expect(result).toEqual([]);
  });

  it("should return the same array when there are no overlapping periods", () => {
    const periods = [
      {
        startDate: Temporal.PlainDate.from("2023-01-01"),
        endDate: Temporal.PlainDate.from("2023-01-10"),
      },
      {
        startDate: Temporal.PlainDate.from("2023-01-15"),
        endDate: Temporal.PlainDate.from("2023-01-20"),
      },
    ];
    const result = mergeDatePeriods(periods);
    expect(result).toEqual(periods);
  });

  it("should merge overlapping periods", () => {
    const periods = [
      {
        startDate: Temporal.PlainDate.from("2023-01-01"),
        endDate: Temporal.PlainDate.from("2023-01-10"),
      },
      {
        startDate: Temporal.PlainDate.from("2023-01-05"),
        endDate: Temporal.PlainDate.from("2023-01-15"),
      },
    ];
    const result = mergeDatePeriods(periods);
    expect(result).toEqual([
      {
        startDate: Temporal.PlainDate.from("2023-01-01"),
        endDate: Temporal.PlainDate.from("2023-01-15"),
      },
    ]);
  });

  it("should merge adjacent periods", () => {
    const periods = [
      {
        startDate: Temporal.PlainDate.from("2023-01-01"),
        endDate: Temporal.PlainDate.from("2023-01-10"),
      },
      {
        startDate: Temporal.PlainDate.from("2023-01-11"),
        endDate: Temporal.PlainDate.from("2023-01-20"),
      },
    ];
    const result = mergeDatePeriods(periods);
    expect(result).toEqual([
      {
        startDate: Temporal.PlainDate.from("2023-01-01"),
        endDate: Temporal.PlainDate.from("2023-01-20"),
      },
    ]);
  });

  it("should handle periods with no end date", () => {
    const periods = [
      {
        startDate: Temporal.PlainDate.from("2023-01-01"),
        endDate: Temporal.PlainDate.from("2023-01-10"),
      },
      {
        startDate: Temporal.PlainDate.from("2023-01-11"),
        endDate: undefined,
      },
    ];
    const result = mergeDatePeriods(periods);
    expect(result).toEqual([
      {
        startDate: Temporal.PlainDate.from("2023-01-01"),
        endDate: undefined,
      },
    ]);
  });

  it("should handle multiple overlapping and adjacent periods", () => {
    const periods = [
      {
        startDate: Temporal.PlainDate.from("2023-01-01"),
        endDate: Temporal.PlainDate.from("2023-01-10"),
      },
      {
        startDate: Temporal.PlainDate.from("2023-01-05"),
        endDate: Temporal.PlainDate.from("2023-01-15"),
      },
      {
        startDate: Temporal.PlainDate.from("2023-01-16"),
        endDate: Temporal.PlainDate.from("2023-01-20"),
      },
    ];
    const result = mergeDatePeriods(periods);
    expect(result).toEqual([
      {
        startDate: Temporal.PlainDate.from("2023-01-01"),
        endDate: Temporal.PlainDate.from("2023-01-20"),
      },
    ]);
  });

  it("should handle non-overlapping periods with one extending indefinitely", () => {
    const periods = [
      {
        startDate: Temporal.PlainDate.from("2023-01-01"),
        endDate: undefined,
      },
      {
        startDate: Temporal.PlainDate.from("2023-02-01"),
        endDate: Temporal.PlainDate.from("2023-02-10"),
      },
    ];
    const result = mergeDatePeriods(periods);
    expect(result).toEqual([
      {
        startDate: Temporal.PlainDate.from("2023-01-01"),
        endDate: undefined,
      },
    ]);
  });
});
