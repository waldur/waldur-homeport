export interface UsageReport {
  customer_name: string;
  project_name: string;
  offering_name: string;
  resource_name: string;
  name: string;
  created: string;
  usage: number;
  measured_unit: string;
  description?: string;
}

export interface UsageReportRequest {
  accounting_period?: string;
  customer_uuid?: string;
  project_uuid?: string;
  offering_uuid?: string;
}
