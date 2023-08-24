import React from 'react';

import { translate } from '@waldur/i18n';
import { OrderActions } from '@waldur/marketplace/orders/actions/OrderActions';
import { TABLE_PENDING_PUBLIC_ORDERS } from '@waldur/marketplace/orders/item/list/constants';
import { OrderItemStateCell } from '@waldur/marketplace/orders/item/list/OrderItemStateCell';
import { OrderItemTypeCell } from '@waldur/marketplace/orders/item/list/OrderItemTypeCell';
import { ResourceNameField } from '@waldur/marketplace/orders/item/list/ResourceNameField';
import { RowNameField } from '@waldur/marketplace/orders/item/list/RowNameField';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { BulkConsumerActions } from './BulkConsumerActions';
import { PENDING_CONSUMER_ORDERS_FILTER } from './constants';

export const PendingConsumerOrders: React.FC<{}> = () => {
  const tableProps = useTable({
    table: TABLE_PENDING_PUBLIC_ORDERS,
    fetchData: createFetcher('marketplace-orders'),
    filter: PENDING_CONSUMER_ORDERS_FILTER,
  });

  return (
    <>
      <Table
        {...tableProps}
        columns={[
          {
            title: translate('Offering'),
            render: ({ row }) => (
              <RowNameField row={row.items[0]} order={row} />
            ),
          },
          {
            title: translate('Resource'),
            render: ({ row }) => <ResourceNameField row={row.items[0]} />,
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
            render: ({ row }) => <OrderItemTypeCell row={row.items[0]} />,
          },
          {
            title: translate('State'),
            render: ({ row }) => <OrderItemStateCell row={row.items[0]} />,
          },
        ]}
        title={translate('Order items')}
        verboseName={translate('Order items')}
        initialSorting={{ field: 'created', mode: 'desc' }}
        initialPageSize={5}
        fullWidth={true}
        hoverableRow={({ row }) => (
          <OrderActions
            orderId={row.uuid}
            customerId={row.customer_uuid}
            projectId={row.project_uuid}
            refetch={tableProps.fetch}
          />
        )}
      />
      <BulkConsumerActions
        orders={tableProps.rows}
        refetch={tableProps.fetch}
      />
    </>
  );
};
