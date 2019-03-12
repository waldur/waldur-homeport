import * as React from 'react';

import { OrderItemDetailsLink } from '@waldur/marketplace/orders/item/details/OrderItemDetailsLink';

export const RowNameField = ({ row }) => (
  <OrderItemDetailsLink
    order_item_uuid={row.uuid}
    customer_uuid={row.customer_uuid}
    project_uuid={row.project_uuid}
  >
    {row.offering_name}
  </OrderItemDetailsLink>
);
