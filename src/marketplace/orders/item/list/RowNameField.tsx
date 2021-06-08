import { FunctionComponent } from 'react';

import { OrderItemDetailsLink } from '@waldur/marketplace/orders/item/details/OrderItemDetailsLink';

export const RowNameField: FunctionComponent<{ row; order }> = ({
  row,
  order,
}) => (
  <OrderItemDetailsLink
    order_item_uuid={row.uuid}
    customer_uuid={row.customer_uuid || order.customer_uuid}
    project_uuid={row.project_uuid || order.project_uuid}
  >
    {row.offering_name}
  </OrderItemDetailsLink>
);
