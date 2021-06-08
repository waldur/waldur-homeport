import { FunctionComponent } from 'react';

import { SupportOrderItemsTable } from '@waldur/marketplace/orders/item/list/SupportOrderItemsTable';

export const OrdersListExpandableRow: FunctionComponent<any> = ({ row }) => (
  <SupportOrderItemsTable order={row} />
);
