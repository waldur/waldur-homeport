import { OrderItemResponse } from '@waldur/marketplace/orders/types';
import { AttributesType, Offering, Plan } from '@waldur/marketplace/types';

export type OrderState = 'Configure' | 'Approve' | 'Review';

export interface State {
  items: OrderItemResponse[];
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
