import { AttributesType } from '@waldur/marketplace/types';

export type OrderState = 'Configure' | 'Approve' | 'Review';

export type PlanUnit = 'month' | 'half_month' | 'day';

export interface StatusChange {
  approving: boolean;
  rejecting: boolean;
}

export type OrderItemType =
  | 'Create'
  | 'Update'
  | 'Terminate'
  ;

export interface OrderItemResponse {
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
  plan_unit?: PlanUnit;
  category_title?: string;
  category_uuid?: string;
  created: string;
}

export interface OrderItemDetailsType extends OrderItemResponse {
  order_uuid: string;
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
}

export interface Order {
  items: OrderItemResponse[];
  state: OrderState;
  total_cost?: number;
  file?: string;
  project_uuid: string;
}
