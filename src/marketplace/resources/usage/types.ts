import {
  ComponentUsage as BaseComponentUsage,
  ComponentUserUsage,
  ResourcePlanPeriod,
} from 'waldur-js-client';

export type { ComponentUserUsage, ResourcePlanPeriod };

export interface ComponentUsage extends BaseComponentUsage {
  component_type?: string;
  total_consumed?: number;
  total_allocated?: number;
}

export interface UsageReportContext {
  resource_uuid: string;
  resource_name: string;
  offering_uuid: string;
  customer_name?: string;
  project_name?: string;
  backend_id?: string;
  userUsage?: boolean;
}
