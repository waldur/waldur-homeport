import { OrderDetails, PublicOfferingDetails } from 'waldur-js-client';

export interface OrderActionProps {
  order: OrderDetails;
  offering?: PublicOfferingDetails;
  refetch?(): void | Promise<void>;
  as?: React.ElementType;
  size?: 'sm';
  labeledDropdown?: boolean;
}
