import { Product } from '@waldur/marketplace/types';

export type OrderState = 'Configure' | 'Approve' | 'Review';

export interface State {
  items: Product[];
  state: OrderState;
  total?: number;
}

export interface OrderItem {
  order: string;
  offering: Product;
}

export interface Order {
  project: string;
  items: OrderItem[];
}
