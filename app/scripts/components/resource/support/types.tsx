export interface TreemapNode {
  name: string;
  path: string;
  value: number;
  children?: TreemapData;
}

export type TreemapData = TreemapNode[];

export interface QuotaChoice {
  key: string;
  title: string;
  tooltipValueFormatter?(value: number): string;
}

export type QuotaList = QuotaChoice[];
