export type OrderState = 'Configure' | 'Approve' | 'Review';

export interface State {
  items: OrderItem[];
  state: OrderState;
  total?: number;
}

export interface OrderItem {
  uuid: string;
  offering_name: string;
  offering_description: string;
  thumbnail: string;
  price: string;
}

export interface Order {
  project: string;
  items: OrderItem[];
}
