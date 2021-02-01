import { AttributesType } from '../types';

export interface ResourceReference {
  offering_type: string;
  resource_uuid: string;
  resource_type: string;
}

export type ResourceState =
  | 'Creating'
  | 'OK'
  | 'Erred'
  | 'Updating'
  | 'Terminating'
  | 'Terminated';

interface ReportSection {
  header: string;
  body: string;
}

export type Report = ReportSection[];

export interface Resource extends ResourceReference {
  name?: string;
  uuid: string;
  url?: string;
  plan?: string;
  attributes: AttributesType;
  backend_metadata?: AttributesType;
  offering_uuid: string;
  offering_name: string;
  offering_type: string;
  state: ResourceState;
  scope?: string;
  created?: string;
  category_title?: string;
  category_uuid?: string;
  customer_name?: string;
  project_name?: string;
  project_uuid?: string;
  customer_uuid?: string;
  is_usage_based?: boolean;
  backend_id?: string;
  limits: Record<string, number>;
  current_usages?: Record<string, number>;
  plan_uuid?: string;
  plan_name?: string;
  report?: Report;
  provider_name: string;
}
