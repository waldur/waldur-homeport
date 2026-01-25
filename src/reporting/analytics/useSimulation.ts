import { useCallback, useMemo, useState } from 'react';

import { SimulationParam, SimulationResult, SimulationState } from './types';

type CalculateFn = (
  params: Record<string, number | string>,
  data: unknown,
) => SimulationResult[];

interface UseSimulationOptions {
  /** Simulation parameters configuration */
  params: SimulationParam[];
  /** Function to calculate results based on param changes */
  calculate: CalculateFn;
  /** Report data to use in calculations */
  data: unknown;
}

interface UseSimulationReturn {
  /** Current state of all parameters */
  paramValues: Record<string, number | string>;
  /** Update a single parameter value */
  setParam: (id: string, value: number | string) => void;
  /** Reset all parameters to defaults */
  resetParams: () => void;
  /** Current simulation results */
  results: SimulationResult[];
  /** Whether simulation is being calculated */
  isCalculating: boolean;
  /** Whether any parameter has changed from default */
  hasChanges: boolean;
}

/**
 * Hook for managing What-If simulation state and calculations
 */
export function useSimulation({
  params,
  calculate,
  data,
}: UseSimulationOptions): UseSimulationReturn {
  // Initialize param values from defaults
  const defaultValues = useMemo(() => {
    const values: Record<string, number | string> = {};
    params.forEach((param) => {
      values[param.id] = param.defaultValue;
    });
    return values;
  }, [params]);

  const [state, setState] = useState<SimulationState>({
    params: defaultValues,
    results: [],
    isCalculating: false,
  });

  // Calculate results whenever params or data change
  const results = useMemo(() => {
    if (!data) return [];
    try {
      return calculate(state.params, data);
    } catch {
      // Silently handle calculation errors
      return [];
    }
  }, [state.params, data, calculate]);

  const setParam = useCallback((id: string, value: number | string) => {
    setState((prev) => ({
      ...prev,
      params: {
        ...prev.params,
        [id]: value,
      },
    }));
  }, []);

  const resetParams = useCallback(() => {
    setState((prev) => ({
      ...prev,
      params: defaultValues,
    }));
  }, [defaultValues]);

  const hasChanges = useMemo(() => {
    return Object.keys(state.params).some(
      (key) => state.params[key] !== defaultValues[key],
    );
  }, [state.params, defaultValues]);

  return {
    paramValues: state.params,
    setParam,
    resetParams,
    results,
    isCalculating: state.isCalculating,
    hasChanges,
  };
}

/**
 * Helper to create a simulation result with change calculation
 */
export function createSimulationResult(
  id: string,
  label: string,
  originalValue: number,
  simulatedValue: number,
  unit?: string,
): SimulationResult {
  const change = simulatedValue - originalValue;
  const changePercent =
    originalValue !== 0 ? (change / originalValue) * 100 : 0;

  let severity: SimulationResult['severity'] = 'neutral';
  if (changePercent > 10) severity = 'danger';
  else if (changePercent > 0) severity = 'warning';
  else if (changePercent < -10) severity = 'success';
  else if (changePercent < 0) severity = 'success';

  return {
    id,
    label,
    originalValue,
    simulatedValue,
    change,
    changePercent,
    unit,
    severity,
  };
}

/**
 * Helper to format simulation result for display
 */
export function formatSimulationChange(result: SimulationResult): string {
  const sign = result.change >= 0 ? '+' : '';
  const value = result.unit
    ? `${sign}${result.change.toFixed(1)} ${result.unit}`
    : `${sign}${result.change.toFixed(1)}`;
  const percent = `(${sign}${result.changePercent.toFixed(1)}%)`;
  return `${value} ${percent}`;
}
