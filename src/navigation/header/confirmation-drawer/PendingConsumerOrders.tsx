import React from 'react';
import { Button } from 'react-bootstrap';
import { marketplaceOrdersList, OrderDetails } from 'waldur-js-client';

import { translate } from '@/i18n';
import { OrderConsumerActions } from '@/marketplace/orders/actions/OrderConsumerActions';
import { TABLE_PENDING_PUBLIC_ORDERS } from '@/marketplace/orders/list/constants';
import { OrderNameField } from '@/marketplace/orders/list/OrderNameField';
import { OrderStateCell } from '@/marketplace/orders/list/OrderStateCell';
import { OrderTypeCell } from '@/marketplace/orders/list/OrderTypeCell';
import { ResourceNameField } from '@/marketplace/orders/list/ResourceNameField';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { PENDING_CONSUMER_ORDERS_FILTER } from './constants';
import { PendingOrderExpandableRow } from './PendingOrderExpandableRow';

export const PendingConsumerOrders: React.FC<{}> = () => {
  const tableProps = useTable({
    table: TABLE_PENDING_PUBLIC_ORDERS,
    fetchData: createFetcher(marketplaceOrdersList),
    filter: PENDING_CONSUMER_ORDERS_FILTER,
  });

  return (
    <Table<OrderDetails>
      {...tableProps}
      columns={[
        {
          title: translate('Offering'),
          render: OrderNameField,
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
          render: OrderTypeCell,
        },
        {
          title: translate('State'),
          render: OrderStateCell,
        },
      ]}
      title={translate('Pending consumer orders')}
      verboseName={translate('Orders')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      initialPageSize={5}
      minHeight="auto"
      expandableRow={PendingOrderExpandableRow}
      rowActions={({ row }) => (
        <OrderConsumerActions
          order={row}
          refetch={tableProps.fetch}
          as={Button}
          size="sm"
        />
      )}
    />
  );
};
