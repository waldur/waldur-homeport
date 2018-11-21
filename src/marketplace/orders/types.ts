import { AttributesType } from '@waldur/marketplace/types';

export type OrderState = 'Configure' | 'Approve' | 'Review';

export interface StatusChange {
  processing: boolean;
  processed: boolean;
}

export interface OrderItemResponse {
  uuid: string;
  offering: string;
  offering_uuid: string;
  offering_name: string;
  offering_description: string;
  offering_thumbnail: string;
  offering_type: string;
  resource_uuid?: string;
  resource_type?: string;
  cost: string;
  estimate?: number;
  unit: string;
  state: string;
  attributes: AttributesType;
  plan?: string;
  plan_name?: string;
  plan_description?: string;
  plan_unit?: string;
  created: string;
}

export interface State {
  items: OrderItemResponse[];
  state: OrderState;
  total_cost?: number;
  file?: string;
}
