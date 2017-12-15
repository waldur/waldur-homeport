export type ChartData = Array<{
  label: string;
  value: number;
}>;

export interface Chart {
  title: string;
  feature?: string;
  current: number;
  change: number;
  data: ChartData;
}

export interface Scope {
  url: string;
  quotas: Array<{
    name: string;
    url: string;
  }>;
}

export interface ChartsState {
  loading: boolean;
  erred: boolean;
  charts: Chart[];
}
