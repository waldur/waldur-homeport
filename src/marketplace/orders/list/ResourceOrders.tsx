import { FunctionComponent, useMemo } from 'react';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { OrderDetailsLink } from '@waldur/marketplace/orders/details/OrderDetailsLink';
import { IssueLinkRenderer } from '@waldur/marketplace/orders/list/IssueLinkRenderer';
import { Resource } from '@waldur/marketplace/resources/types';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { CancelTerminationOrderButton } from '../actions/CancelTerminationOrderButton';

import { OrderStateCell } from './OrderStateCell';
import { OrderTypeCell } from './OrderTypeCell';

interface ResourceOrdersProps {
  resource: Resource;
  id?: string;
}

export const ResourceOrders: FunctionComponent<ResourceOrdersProps> = (
  props,
) => {
  const filter = useMemo(
    () => ({
      resource_uuid: props.resource.uuid,
      o: '-created',
    }),
    [props.resource.uuid],
  );
  const tableProps = useTable({
    table: `ResourceOrders-${props.resource.uuid}`,
    fetchData: createFetcher('marketplace-orders'),
    filter,
  });
  const columns = [
    {
      title: translate('ID'),
      render: ({ row }) => (
        <div className="d-flex align-items-center gap-1">
          <OrderDetailsLink
            order_uuid={row.uuid}
            customer_uuid={row.customer_uuid}
            project_uuid={row.project_uuid}
          >
            {row.uuid}
          </OrderDetailsLink>
          <CopyToClipboardButton value={row.uuid} />
        </div>
      ),
    },
    {
      title: translate('Issue link'),
      render: IssueLinkRenderer,
    },
    {
      title: translate('Type'),
      render: OrderTypeCell,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
    },
    {
      title: translate('State'),
      render: OrderStateCell,
    },
  ];

  return (
    <Table
      {...tableProps}
      title={translate('Resource orders')}
      columns={columns}
      verboseName={translate('orders')}
      rowActions={CancelTerminationOrderButton}
    />
  );
};
