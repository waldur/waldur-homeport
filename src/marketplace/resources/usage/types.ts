export {
  ComponentUsage,
  ComponentUserUsage,
  ResourcePlanPeriod,
} from 'waldur-js-client';

export interface UsageReportContext {
  resource_uuid: string;
  resource_name: string;
  offering_uuid: string;
  customer_name?: string;
  project_name?: string;
  backend_id?: string;
  userUsage?: boolean;
}
