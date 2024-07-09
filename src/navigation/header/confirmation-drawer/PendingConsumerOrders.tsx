import React from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { OrderConsumerActions } from '@waldur/marketplace/orders/actions/OrderConsumerActions';
import { TABLE_PENDING_PUBLIC_ORDERS } from '@waldur/marketplace/orders/list/constants';
import { OrderNameField } from '@waldur/marketplace/orders/list/OrderNameField';
import { OrderStateCell } from '@waldur/marketplace/orders/list/OrderStateCell';
import { OrderTypeCell } from '@waldur/marketplace/orders/list/OrderTypeCell';
import { ResourceNameField } from '@waldur/marketplace/orders/list/ResourceNameField';
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
        title={translate('Orders')}
        verboseName={translate('Orders')}
        initialSorting={{ field: 'created', mode: 'desc' }}
        initialPageSize={5}
        hoverableRow={({ row }) => (
          <OrderConsumerActions
            order={row}
            refetch={tableProps.fetch}
            as={Button}
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
