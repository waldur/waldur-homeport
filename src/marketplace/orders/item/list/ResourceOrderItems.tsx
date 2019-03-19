import * as React from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { OrderItemDetailsLink } from '@waldur/marketplace/orders/item/details/OrderItemDetailsLink';
import { connectAngularComponent } from '@waldur/store/connect';
import { Table, connectTable, createFetcher } from '@waldur/table-react';

interface ResourceOrderItemsProps {
  resource_uuid: string;
}

export const TableComponent = props => {
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
      title: translate('Type'),
      render: ({ row }) => row.type,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
    },
    {
      title: translate('State'),
      render: ({ row }) => row.state,
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

export const ResourceOrderItems = enhance(TableComponent) as
  React.ComponentType<ResourceOrderItemsProps>;

const ResourceOrderItemsTab = props => props.resource.marketplace_resource_uuid ? (
  <ResourceOrderItems resource_uuid={props.resource.marketplace_resource_uuid}/>
) : (
  <h3>{translate('Resource is not connected to the marketplace yet.')}</h3>
);

export default connectAngularComponent(ResourceOrderItemsTab, ['resource']);
