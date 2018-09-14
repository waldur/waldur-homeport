import { OrderItemResponse } from '@waldur/marketplace/orders/types';
import { Offering, Plan } from '@waldur/marketplace/types';

export type OrderState = 'Configure' | 'Approve' | 'Review';

export interface AttributesType {
  [key: string]: any;
}

export interface State {
  items: OrderItemRequest[];
  state: OrderState;
  total_cost?: number;
}

export interface Order {
  project: string;
  items: OrderItemResponse[];
}

export interface OrderItemRequest {
  offering: Offering;
  plan?: Plan;
  attributes?: AttributesType;
  limits?: {[key: string]: number};
}
