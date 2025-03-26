import { describe, it, expect } from "vitest";
import { Temporal } from "@js-temporal/polyfill";
import { getCalculcationForDate, calculate } from "@/lib/calculation";
import { Component } from "@/types/income";

describe("getCalculcationForDate", () => {
  it("should return the calculation for a one-time component when the date matches", () => {
    const component: Component = {
      id: "one",
      name: "One-time Component",
      type: "one-time",
      date: Temporal.PlainDate.from("2023-10-01"),
      calculation: {
        inputs: [],
        func: "return 100;",
        dependencies: [],
      },
    };

    const date = Temporal.PlainYearMonth.from("2023-10");
    const result = getCalculcationForDate(component, date);

    expect(result).toEqual({
      id: "one",
      name: "One-time Component",
      calculation: {
        inputs: [],
        func: "return 100;",
        dependencies: [],
      },
    });
  });

  it("should return undefined for a one-time component when the date does not match", () => {
    const component: Component = {
      id: "one",
      name: "One-time Component",
      type: "one-time",
      date: Temporal.PlainDate.from("2023-10-01"),
      calculation: {
        inputs: [],
        func: "return 100;",
        dependencies: [],
      },
    };

    const date = Temporal.PlainYearMonth.from("2023-09");
    const result = getCalculcationForDate(component, date);

    expect(result).toBeUndefined();
  });

  it("should return the calculation for a recurring component when the date is within the period", () => {
    const component: Component = {
      id: "two",
      name: "Recurring Component",
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
    };

    const date = Temporal.PlainYearMonth.from("2023-06");
    const result = getCalculcationForDate(component, date);

    expect(result).toEqual({
      id: "two",
      name: "Recurring Component",
      calculation: {
        inputs: [],
        func: "return 200;",
        dependencies: [],
      },
    });
  });

  it("should return undefined for a recurring component when the date is outside the period", () => {
    const component: Component = {
      id: "two",
      name: "Recurring Component",
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
    };

    const date = Temporal.PlainYearMonth.from("2024-01");
    const result = getCalculcationForDate(component, date);

    expect(result).toBeUndefined();
  });

  it("should return the calculation for a recurring component with no end date when the date is after the start date", () => {
    const component: Component = {
      id: "three",
      name: "Recurring Component No End Date",
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
    };

    const date = Temporal.PlainYearMonth.from("2024-01");
    const result = getCalculcationForDate(component, date);

    expect(result).toEqual({
      id: "three",
      name: "Recurring Component No End Date",
      calculation: {
        inputs: [],
        func: "return 300;",
        dependencies: [],
      },
    });
  });
});

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
      "Circular dependency detected involving one"
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
