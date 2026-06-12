import { OrderDetails, Offering } from 'waldur-js-client';

export interface OrderActionProps {
  order: OrderDetails;
  offering?: Offering;
  refetch?(): void | Promise<void>;
  as?: React.ElementType;
  size?: 'sm';
  labeledDropdown?: boolean;
}
