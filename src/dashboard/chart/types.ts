export type ChartData = Array<{
  label: string;
  value: number;
}>;

export interface Chart {
  title: string;
  units?: string;
  feature?: string;
  current: number;
  change: number;
  data: ChartData;
}

export interface Scope {
  url: string;
}

export interface ChartsState {
  loading: boolean;
  erred: boolean;
  charts: Chart[];
}
