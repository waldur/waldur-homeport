import { AttributesType } from '@waldur/marketplace/types';

export type OrderState = 'Configure' | 'Approve' | 'Review';

export type PlanUnit = 'month' | 'half_month' | 'day';

export interface StatusChange {
  approving: boolean;
  rejecting: boolean;
}

export interface OrderItemResponse {
  uuid: string;
  offering: string;
  offering_uuid: string;
  offering_name: string;
  offering_description: string;
  offering_thumbnail: string;
  offering_type: string;
  offering_terms_of_service: string;
  offering_shared: boolean;
  marketplace_resource_uuid?: string;
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
  created: string;
}

export interface State {
  items: OrderItemResponse[];
  state: OrderState;
  total_cost?: number;
  file?: string;
}
