import { AttributesType, BillingPeriod } from '@waldur/marketplace/types';

export type OrderStep = 'Configure' | 'Approve' | 'Review';

export type OrderState =
  | 'requested for approval'
  | 'executing'
  | 'done'
  | 'terminated'
  | 'erred';

export interface StatusChange {
  approving: boolean;
  rejecting: boolean;
}

export type OrderItemType = 'Create' | 'Update' | 'Terminate';

interface IssueReference {
  key: string;
  uuid: string;
}

export interface OrderItemResponse {
  fixed_price?: number;
  activation_price?: number;
  name?: string;
  uuid: string;
  type: OrderItemType;
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
  cost: string;
  estimate?: number;
  unit: string;
  state: string;
  attributes: AttributesType;
  plan_uuid?: string;
  plan?: string;
  plan_name?: string;
  plan_description?: string;
  plan_unit?: BillingPeriod;
  project: string;
  project_name: string;
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

export interface OrderItemDetailsType extends OrderItemResponse {
  order_uuid: string;
  order_approved_at?: string;
  order_approved_by?: string;
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
}

export interface Order {
  items: OrderItemResponse[];
  state: OrderState;
  total_cost?: number;
  file?: string;
  project?: string;
  project_uuid?: string;
  customer_uuid?: string;
}
