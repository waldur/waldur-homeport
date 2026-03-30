import { ReactNode } from 'react';

/**
 * Analytics modes supported by the reporting system
 * - what-if: Scenario analysis - "What would happen if...?"
 * - why-so: Root cause analysis - "Why did this happen?"
 */
export type AnalyticsMode = 'what-if' | 'why-so';

/**
 * Parameter types for What-If simulation
 */
type SimulationParamType =
  | 'number'
  | 'percentage'
  | 'currency'
  | 'slider'
  | 'select';

/**
 * A single parameter that can be adjusted in What-If simulation
 */
export interface SimulationParam {
  id: string;
  label: string;
  description?: string;
  type: SimulationParamType;
  defaultValue: number | string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  /** Options for 'select' type */
  options?: Array<{ value: string | number; label: string }>;
}

/**
 * Result of a What-If simulation calculation
 */
export interface SimulationResult {
  id: string;
  label: string;
  originalValue: number;
  simulatedValue: number;
  change: number;
  changePercent: number;
  unit?: string;
  severity?: 'success' | 'warning' | 'danger' | 'neutral';
}

/**
 * State for a What-If simulation session
 */
export interface SimulationState {
  params: Record<string, number | string>;
  results: SimulationResult[];
  isCalculating: boolean;
}

/**
 * Single item in drill-down data
 */
export interface DrillDownDataItem {
  id: string;
  label: string;
  renderLabel?: (item: DrillDownDataItem) => ReactNode;
  value: number;
  /** Percentage of parent total */
  percentage: number;
  /** Whether this item can be drilled into further */
  canDrillDown: boolean;
  /** Additional metadata for display */
  metadata?: Record<string, unknown>;
  /** Change from previous period (if available) */
  change?: {
    value: number;
    percent: number;
    direction: 'up' | 'down' | 'stable';
  };
}

/**
 * Configuration for a drill-down path
 */
export interface DrillDownPath {
  from: string;
  to: string;
  dimension: string;
  /** Function to fetch data for the next level */
  fetchData?: (parentId: string) => Promise<DrillDownDataItem[]>;
}

/**
 * Props for analytics-enabled reports
 */
export interface AnalyticsCapability {
  /** Which analytics modes this report supports */
  supportedModes: AnalyticsMode[];
  /** Parameters for What-If simulation */
  simulationParams?: SimulationParam[];
  /** Available drill-down paths for Why-So analysis */
  drillDownPaths?: DrillDownPath[];
  /** Custom calculation function for What-If */
  calculateSimulation?: (
    params: Record<string, number | string>,
    data: unknown,
  ) => SimulationResult[];
  /** Initial dimension for Why-So drill-down */
  initialDimension?: string;
  /** Custom label for the 'Value' column in Why-So mode */
  whySoValueLabel?: string | ((total: number) => string);
}
