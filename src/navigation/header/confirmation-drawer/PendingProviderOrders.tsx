import React from 'react';

import { translate } from '@waldur/i18n';
import { TABLE_PENDING_PROVIDER_PUBLIC_ORDERS } from '@waldur/marketplace/orders/item/list/constants';
import { OrderItemActionsCell } from '@waldur/marketplace/orders/item/list/OrderItemActionsCell';
import { OrderItemslistTablePlaceholder } from '@waldur/marketplace/orders/item/list/OrderItemsListPlaceholder';
import { OrderItemStateCell } from '@waldur/marketplace/orders/item/list/OrderItemStateCell';
import { OrderItemTypeCell } from '@waldur/marketplace/orders/item/list/OrderItemTypeCell';
import { ResourceNameField } from '@waldur/marketplace/orders/item/list/ResourceNameField';
import { RowNameField } from '@waldur/marketplace/orders/item/list/RowNameField';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { BulkProviderActions } from './BulkProviderActions';
import { PENDING_PROVIDER_ORDERS_FILTER } from './constants';
import { OrderItemExpandableRow } from './OrderItemExpandableRow';

export const PendingProviderOrders: React.FC<{}> = () => {
  const tableProps = useTable({
    table: TABLE_PENDING_PROVIDER_PUBLIC_ORDERS,
    fetchData: createFetcher('marketplace-order-items'),
    filter: PENDING_PROVIDER_ORDERS_FILTER,
  });

  const columns = [
    {
      title: translate('Offering'),
      render: RowNameField,
    },
    {
      title: translate('Resource'),
      render: ResourceNameField,
    },
    {
      title: translate('Organization'),
      render: ({ row }) => row.customer_name,
    },
    {
      title: translate('Project'),
      render: ({ row }) => row.project_name,
    },
    {
      title: translate('Type'),
      render: OrderItemTypeCell,
    },
    {
      title: translate('State'),
      render: OrderItemStateCell,
    },
  ];

  return (
    <div>
      <Table
        {...tableProps}
        placeholderComponent={<OrderItemslistTablePlaceholder />}
        columns={columns}
        title={translate('Order items')}
        verboseName={translate('Order items')}
        initialSorting={{ field: 'created', mode: 'desc' }}
        initialPageSize={5}
        expandableRow={OrderItemExpandableRow}
        hoverableRow={({ row }) => (
          <OrderItemActionsCell row={row} refetch={tableProps.fetch} />
        )}
        fullWidth={true}
      />
      <div className="is-flex">
        <BulkProviderActions orders={tableProps.rows} />
      </div>
    </div>
  );
};
