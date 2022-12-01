import React from 'react';

import { TABLE_PENDING_PUBLIC_ORDERS } from '@waldur/marketplace/orders/item/list/constants';
import { OrderItemResponse } from '@waldur/marketplace/orders/types';
import { connectTable, createFetcher } from '@waldur/table';

import { BulkActionButtons } from './BulkActionButtons';
import { OrderItemsTable } from './OrderItemsTable';

interface OwnProps {
  rows: OrderItemResponse[];
}

const PurePendingOrderConfirmation: React.FC<OwnProps> = (props) => (
  <div>
    <OrderItemsTable {...props} />
    <div className="is-flex">
      <BulkActionButtons orders={props.rows} />
    </div>
  </div>
);

const OrderItemsListTableOptions = {
  table: TABLE_PENDING_PUBLIC_ORDERS,
  fetchData: createFetcher('marketplace-order-items'),
  getDefaultFilter: () => ({
    state: ['pending'],
    can_manage_as_owner: 'True',
  }),
};

const enhance = connectTable(OrderItemsListTableOptions);

export const PendingOrderConfirmation = enhance(
  PurePendingOrderConfirmation,
) as React.ComponentType<any>;
