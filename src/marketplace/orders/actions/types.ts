import { OrderResponse } from '../types';

export interface OrderActionProps {
  order: OrderResponse;
  refetch?(): void;
  as?: React.ElementType;
}
