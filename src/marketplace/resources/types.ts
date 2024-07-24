import { OrderDetailsType } from '../orders/types';
import { AttributesType } from '../types';

interface ResourceReference {
  marketplace_resource_uuid?: string;
  offering_type: string;
  resource_uuid: string;
  resource_type: string;
  backend_id?: string;
  project_uuid?: string;
  end_date?: string;
  project_end_date?: string;
}

type ResourceState =
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
  slug?: string;
  description: any;
  name?: string;
  uuid: string;
  url?: string;
  plan?: string;
  attributes: AttributesType;
  backend_metadata?: AttributesType;
  error_message?: string;
  error_traceback?: string;
  offering: string;
  offering_uuid: string;
  offering_name: string;
  offering_type: string;
  offering_thumbnail?: string;
  offering_plugin_options?: Record<string, any>;
  options?: Record<string, any>;
  state: ResourceState;
  scope?: string;
  created?: string;
  category_title: string;
  category_uuid?: string;
  category_icon?: string;
  customer_name?: string;
  project?: string;
  project_name?: string;
  project_uuid?: string;
  customer_uuid?: string;
  is_usage_based?: boolean;
  is_limit_based?: boolean;
  backend_id?: string;
  effective_id?: string;
  access_url?: string;
  limits: Record<string, number>;
  current_usages?: Record<string, number>;
  plan_uuid?: string;
  plan_name?: string;
  parent_uuid?: string;
  parent_name?: string;
  report?: Report;
  provider_name: string;
  marketplace_offering_uuid?: string;
  marketplace_resource_uuid?: string;
  end_date?: string;
  username?: string;
  order_in_progress?: OrderDetailsType;
  creation_order?: OrderDetailsType;
}
