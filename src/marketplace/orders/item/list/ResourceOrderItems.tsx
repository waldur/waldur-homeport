import React, { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { OrderItemDetailsLink } from '@waldur/marketplace/orders/item/details/OrderItemDetailsLink';
import { IssueLinkRenderer } from '@waldur/marketplace/orders/item/list/IssueLinkRenderer';
import { Table, connectTable, createFetcher } from '@waldur/table';

import { OrderItemStateCell } from './OrderItemStateCell';
import { OrderItemTypeCell } from './OrderItemTypeCell';

interface ResourceOrderItemsProps {
  resource_uuid: string;
}

export const TableComponent: FunctionComponent<any> = (props) => {
  const columns = [
    {
      title: translate('ID'),
      render: ({ row }) => (
        <OrderItemDetailsLink
          order_item_uuid={row.uuid}
          customer_uuid={row.customer_uuid}
          project_uuid={row.project_uuid}
        >
          {row.uuid}
        </OrderItemDetailsLink>
      ),
    },
    {
      title: translate('Issue link'),
      render: IssueLinkRenderer,
    },
    {
      title: translate('Type'),
      render: OrderItemTypeCell,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
    },
    {
      title: translate('State'),
      render: OrderItemStateCell,
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('order items')}
    />
  );
};

const mapPropsToFilter = (props: ResourceOrderItemsProps) => ({
  resource_uuid: props.resource_uuid,
  o: '-created',
});

const TableOptions = {
  table: 'ResourceOrderItems',
  fetchData: createFetcher('marketplace-order-items'),
  mapPropsToFilter,
};

const enhance = connectTable(TableOptions);

export const ResourceOrderItems = enhance(
  TableComponent,
) as React.ComponentType<ResourceOrderItemsProps>;

export const ResourceOrderItemsTab = (props) =>
  props.resource.marketplace_resource_uuid ? (
    <ResourceOrderItems
      resource_uuid={props.resource.marketplace_resource_uuid}
    />
  ) : (
    <h3>{translate('Resource is not connected to the marketplace yet.')}</h3>
  );
