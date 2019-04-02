import { PlanUnit } from '@waldur/marketplace/orders/types';

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
  date_after?: string;
  date_before?: string;
  customer_uuid?: string;
  project_uuid?: string;
  offering_uuid?: string;
}

export interface UsageReportContext {
  resource_uuid: string;
  offering_uuid: string;
}

export interface ResourcePlanPeriod {
  plan_name: string;
  plan_uuid: string;
  start: string;
  end: string;
}
