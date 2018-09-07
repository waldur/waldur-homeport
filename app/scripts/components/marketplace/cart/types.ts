import { Offering, Plan } from '@waldur/marketplace/types';

export type OrderState = 'Configure' | 'Approve' | 'Review';

export interface State {
  items: any[]; // a temporary workaround before the upcoming MR
  state: OrderState;
  total_cost?: number;
}

export interface OrderItemResponse {
  uuid: string;
  offering_uuid: string;
  offering_name: string;
  offering_description: string;
  offering_thumbnail: string;
  resource_uuid: string;
  resource_type: string;
  cost: string;
}

export interface Order {
  project: string;
  items: OrderItemResponse[];
}

export interface OrderItemRequest {
  offering: Offering;
  plan?: Plan;
  attributes?: {[key: string]: any};
}
