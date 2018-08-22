export type OrderState = 'Configure' | 'Approve' | 'Review';

export interface State {
  items: OrderItem[];
  state: OrderState;
  total_cost?: number;
}

export interface OrderItem {
  uuid: string;
  offering_uuid: string;
  offering_name: string;
  offering_description: string;
  offering_thumbnail: string;
  cost: string;
}

export interface Order {
  project: string;
  items: OrderItem[];
}
