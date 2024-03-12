export interface QuotaChoice {
  key: string;
  title: string;
  tooltipValueFormatter?(value: number): string;
  hidden?: boolean;
}

export interface CustomerQuota {
  customer_name: string;
  customer_abbreviation: string;
  value: number;
}
