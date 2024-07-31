import { FunctionComponent } from 'react';

import { OrderDetailsLink } from '@waldur/marketplace/orders/details/OrderDetailsLink';

export const OrderNameField: FunctionComponent<{ row }> = ({ row }) => (
  <OrderDetailsLink
    order_uuid={row.uuid}
    customer_uuid={row.customer_uuid}
    project_uuid={row.project_uuid}
  >
    {row.offering_name}
  </OrderDetailsLink>
);
