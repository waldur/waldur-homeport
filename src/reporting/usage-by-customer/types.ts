export interface CustomerUsageRow {
  customer_uuid: string;
  customer_name: string;
  customer_abbreviation: string | null;
  resources_ok: number;
  resources_erred: number;
  resources_total: number;
  total_cost: string;
  usages: Record<string, string>;
  limits: Record<string, number>;
}

export interface UsageByCustomerSummary {
  totalCustomers: number;
  totalResources: number;
  totalCost: number;
  customersWithErrors: number;
}
