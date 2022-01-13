export interface UsageReport {
  customer_name: string;
  project_name: string;
  offering_name: string;
  resource_name: string;
  name: string;
  created: string;
  date: string;
  usage: number;
  measured_unit: string;
  description?: string;
}

export interface UsageReportRequest {
  billing_period?: string;
  customer_uuid?: string;
  project_uuid?: string;
  offering_uuid?: string;
}

export interface UsageReportContext {
  resource_uuid: string;
  resource_name: string;
  offering_uuid: string;
  customer_name?: string;
  project_name?: string;
  backend_id?: string;
}

export interface ComponentUsage {
  name: string;
  type: string;
  measured_unit: string;
  usage: number;
  date: string;
  description: string;
  billing_period: string;
  recurring: boolean;
}

export interface ResourcePlanPeriod {
  uuid: string;
  plan_name: string;
  plan_uuid: string;
  start: string;
  end: string;
  components: ComponentUsage[];
}
