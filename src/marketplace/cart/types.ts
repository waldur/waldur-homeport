import { AtLeast } from '@waldur/core/types';
import { OrderResponse } from '@waldur/marketplace/orders/types';
import { AttributesType, Offering, Plan } from '@waldur/marketplace/types';

export interface CartState {
  items: OrderResponse[];
  addingItem: boolean;
  removingItem: boolean;
  updatingItem: boolean;
  creatingOrder: boolean;
}

export interface SubmitCartRequest {
  project: string;
}

export interface OrderRequest {
  offering: AtLeast<Offering, 'url'>;
  plan?: AtLeast<Plan, 'url'>;
  project?: string;
  attributes?: AttributesType;
  limits?: { [key: string]: number };
}
