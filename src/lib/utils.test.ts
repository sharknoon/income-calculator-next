import { jsDateToPlainDate, plainDateToJsDate } from "./utils";
import { Temporal } from "@js-temporal/polyfill";
import { describe, expect, it } from "vitest";

describe("plainDateToJsDate", () => {
  it("should convert a Temporal.PlainDate to a JavaScript Date", () => {
    const plainDate = Temporal.PlainDate.from("2023-03-15");
    const jsDate = plainDateToJsDate(plainDate);

    expect(jsDate).toBeInstanceOf(Date);
    expect(jsDate.toISOString().startsWith("2023-03-15")).toBe(true);
  });

  it("should handle leap years correctly", () => {
    const plainDate = Temporal.PlainDate.from("2024-02-29");
    const jsDate = plainDateToJsDate(plainDate);

    expect(jsDate).toBeInstanceOf(Date);
    expect(jsDate.toISOString().startsWith("2024-02-29")).toBe(true);
  });

  it("should handle invalid Temporal.PlainDate inputs gracefully", () => {
    expect(() => {
      // @ts-expect-error: Testing invalid input
      plainDateToJsDate(null);
    }).toThrow();

    expect(() => {
      // @ts-expect-error: Testing invalid input
      plainDateToJsDate(undefined);
    }).toThrow();
  });
});

describe("jsDateToPlainDate", () => {
  it("should convert a JavaScript Date to a Temporal.PlainDate", () => {
    const jsDate = new Date("2023-03-15T00:00:00Z");
    const plainDate = jsDateToPlainDate(jsDate);

    expect(plainDate).toBeInstanceOf(Temporal.PlainDate);
    expect(plainDate.toString()).toBe("2023-03-15");
  });

  it("should handle leap years correctly", () => {
    const jsDate = new Date("2024-02-29T00:00:00Z");
    const plainDate = jsDateToPlainDate(jsDate);

    expect(plainDate).toBeInstanceOf(Temporal.PlainDate);
    expect(plainDate.toString()).toBe("2024-02-29");
  });

  it("should handle invalid JavaScript Date inputs gracefully", () => {
    expect(() => {
      // @ts-expect-error: Testing invalid input
      jsDateToPlainDate(null);
    }).toThrow();

    expect(() => {
      // @ts-expect-error: Testing invalid input
      jsDateToPlainDate(undefined);
    }).toThrow();

    expect(() => {
      jsDateToPlainDate(new Date("invalid-date"));
    }).toThrow();
  });
});
