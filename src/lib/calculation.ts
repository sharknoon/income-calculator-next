import { Calculation, Component, InputValue } from "@/types/income";
import { Temporal } from "@js-temporal/polyfill";

export interface ComponentCalculation {
  id: string;
  name: string;
  calculation: Calculation;
}

export interface ComponentResult {
  id: string;
  name: string;
  amount: number;
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
 * Gets the calculation for a given date from a component
 * @param component The recurring or one-time component
 * @param date The date to find the period for / to check the one-time date against
 * @returns The first matching calculation for the given date or undefined if no match
 */
export function getCalculcationsForDate(
  component: Component,
  startDate: Temporal.PlainDate,
  endDate: Temporal.PlainDate,
): Array<ComponentCalculation> {
  if (component.type === "one-time") {
    if (Temporal.PlainYearMonth.compare(component.date, date) === 0) {
      return {
        id: component.id,
        name: component.name,
        calculation: { ...component.calculation },
      };
    }
  } else {
    for (const period of component.calculationPeriods) {
      if (
        Temporal.PlainYearMonth.compare(period.period.startDate, date) <= 0 &&
        (!period.period.endDate ||
          Temporal.PlainYearMonth.compare(period.period.endDate, date) >= 0)
      ) {
        return {
          id: component.id,
          name: component.name,
          calculation: { ...period.calculation },
        };
      }
    }
  }
}
