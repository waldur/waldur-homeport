export type ChartData = Array<{
  label: string,
  value: number,
}>;

export type Chart = {
  title: string,
  feature?: string,
  current: number,
  change: number,
  data: ChartData
};

export type Scope = {
  url: string,
  quotas: Array<{
    name: string,
    url: string,
  }>,
};

export type ChartsState = {
  loading: boolean,
  erred: boolean,
  charts: Array<Chart>,
};
