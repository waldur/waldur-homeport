import { AttributesType, BillingPeriod } from '@waldur/marketplace/types';

export type OrderState =
  | 'pending-consumer'
  | 'pending-provider'
  | 'executing'
  | 'done'
  | 'canceled'
  | 'erred'
  | 'rejected';

type OrderType = 'Create' | 'Update' | 'Terminate';

interface IssueReference {
  key: string;
  uuid: string;
}

export interface OrderResponse {
  file?: string;
  fixed_price?: number;
  activation_price?: number;
  name?: string;
  uuid: string;
  type: OrderType;
  offering: string;
  offering_uuid: string;
  offering_name: string;
  offering_description: string;
  offering_thumbnail: string;
  offering_type: string;
  offering_terms_of_service: string;
  offering_shared: boolean;
  offering_billable: boolean;
  output?: string;
  marketplace_resource_uuid?: string;
  resource_name?: string;
  resource_uuid?: string;
  resource_type?: string;
  cost: number;
  estimate?: number;
  unit: string;
  state: OrderState;
  attributes: AttributesType;
  plan_uuid?: string;
  plan?: string;
  plan_name?: string;
  old_plan_name?: string;
  new_plan_name?: string;
  old_plan_uuid?: string;
  new_plan_uuid?: string;
  plan_description?: string;
  plan_unit?: BillingPeriod;
  project: string;
  project_uuid?: string;
  project_name: string;
  project_description?: string;
  customer_name?: string;
  customer_uuid?: string;
  category_title?: string;
  category_uuid?: string;
  created: string;
  modified: string;
  error_message?: string;
  error_traceback?: string;
  limits: Record<string, number>;
  current_usages?: Record<string, number>;
  scope?: string;
  issue?: IssueReference;
}

export interface OrderDetailsType extends OrderResponse {
  consumer_reviewed_at?: string;
  consumer_reviewed_by?: string;
  consumer_reviewed_by_full_name?: string;
  provider_reviewed_at?: string;
  provider_reviewed_by?: string;
  provider_reviewed_by_full_name?: string;
  created_by_full_name: string;
  created_by_civil_number: string;
  customer_name: string;
  customer_uuid: string;
  project_name: string;
  project_uuid: string;
  old_plan_name: string;
  new_plan_name: string;
  old_cost_estimate: string;
  new_cost_estimate: string;
  can_terminate: boolean;
  backend_id?: string;
}
