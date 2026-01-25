export interface ResourceMissingUsage {
  uuid: string;
  name: string;
  offering_name: string;
  offering_uuid: string;
  provider_name: string;
  provider_uuid: string;
  customer_name: string;
  customer_uuid: string;
  project_name: string;
  project_uuid: string;
  last_usage_date: string | null;
  days_since_last_report: number | null;
  state: string;
  created: string;
}
