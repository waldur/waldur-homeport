export interface TopCustomer {
  customer_uuid: string;
  customer_name: string;
  resource_count?: number;
  revenue?: number;
}

export interface MonthlyData {
  month: string;
  customer_count: number;
}
