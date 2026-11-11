import React from 'react';
import { marketplaceOrdersList, OrderDetails } from 'waldur-js-client';

import { translate } from '@/i18n';
import { OrderConsumerActions } from '@/marketplace/orders/actions/OrderConsumerActions';
import { canReviewOrderAsConsumer } from '@/marketplace/orders/actions/selectors';
import { TABLE_PENDING_PUBLIC_ORDERS } from '@/marketplace/orders/list/constants';
import { OrderNameField } from '@/marketplace/orders/list/OrderNameField';
import { OrderStateCell } from '@/marketplace/orders/list/OrderStateCell';
import { OrderTypeCell } from '@/marketplace/orders/list/OrderTypeCell';
import { ResourceNameField } from '@/marketplace/orders/list/ResourceNameField';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { useUser } from '@/workspace/hooks';

import { PENDING_CONSUMER_ORDERS_FILTER } from './constants';
import { PendingOrderExpandableRow } from './PendingOrderExpandableRow';

export const PendingConsumerOrders: React.FC<{}> = () => {
  const user = useUser();
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
      rowActions={({ row }) =>
        row.state === 'pending-consumer' &&
        canReviewOrderAsConsumer(user, row) ? (
          <ActionsDropdown row={row} refetch={tableProps.fetch} side="bottom">
            <OrderConsumerActions order={row} refetch={tableProps.fetch} />
          </ActionsDropdown>
        ) : null
      }
    />
  );
};
