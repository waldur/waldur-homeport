export interface ResourceOption {
  uuid: string;
  name: string;
  resource_name: string;
}

export interface LimitHistoryPoint {
  date: string;
  limit_name: string;
  limit_value: number;
}

export interface UsageHistoryPoint {
  date: string;
  type: string;
  usage: number;
  cumulative_usage: number;
}

export interface ComponentTypeOption {
  value: string;
  label: string;
  measured_unit?: string;
}

/** Map of component type to label from offering components */
export type ComponentLabelMap = Record<string, string>;
