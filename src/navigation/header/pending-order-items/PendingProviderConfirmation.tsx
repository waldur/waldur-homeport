import React from 'react';

import { REMOTE_OFFERING_TYPE } from '@waldur/marketplace-remote/constants';
import { TABLE_PENDING_PROVIDER_PUBLIC_ORDERS } from '@waldur/marketplace/orders/item/list/constants';
import { OrderItemResponse } from '@waldur/marketplace/orders/types';
import { connectTable, createFetcher } from '@waldur/table';

import { BulkActionButtons } from './BulkActionButtons';
import { OrderItemsTable } from './OrderItemsTable';

interface OwnProps {
  rows: OrderItemResponse[];
}

const PurePendingProviderConfirmation: React.FC<OwnProps> = (props) => (
  <div>
    <OrderItemsTable {...props} />
    <div className="is-flex">
      <BulkActionButtons orders={props.rows} />
    </div>
  </div>
);

const OrderItemsListTableOptions = {
  table: TABLE_PENDING_PROVIDER_PUBLIC_ORDERS,
  fetchData: createFetcher('marketplace-order-items'),
  getDefaultFilter: () => ({
    offering_type: ['Marketplace.Basic', REMOTE_OFFERING_TYPE],
    state: ['executing'],
    can_manage_as_service_provider: 'True',
  }),
};

const enhance = connectTable(OrderItemsListTableOptions);

export const PendingProviderConfirmation = enhance(
  PurePendingProviderConfirmation,
) as React.ComponentType<any>;
