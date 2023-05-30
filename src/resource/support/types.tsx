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
  hidden?: boolean;
}

export type QuotaList = QuotaChoice[];

export interface ProjectQuota {
  project_name: string;
  customer_name: string;
  customer_abbreviation: string;
  value: number;
}
