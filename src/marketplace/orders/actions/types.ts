import { OrderDetails, PublicOfferingDetails } from 'waldur-js-client';

export interface OrderActionProps {
  order: OrderDetails;
  offering?: PublicOfferingDetails;
  refetch?(): void;
  as?: React.ElementType;
}
