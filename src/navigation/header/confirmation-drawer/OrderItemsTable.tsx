import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { OrderItemslistTablePlaceholder } from '@waldur/marketplace/orders/item/list/OrderItemsListPlaceholder';
import { OrderItemStateCell } from '@waldur/marketplace/orders/item/list/OrderItemStateCell';
import { OrderItemTypeCell } from '@waldur/marketplace/orders/item/list/OrderItemTypeCell';
import { ResourceNameField } from '@waldur/marketplace/orders/item/list/ResourceNameField';
import { RowNameField } from '@waldur/marketplace/orders/item/list/RowNameField';
import { Table } from '@waldur/table';

import { OrderItemActionsCell } from './OrderItemActionsCell';
import { OrderItemExpandableRow } from './OrderItemExpandableRow';

export const OrderItemsTable: FunctionComponent<any> = (props) => {
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
    <Table
      {...props}
      placeholderComponent={<OrderItemslistTablePlaceholder />}
      columns={columns}
      title={translate('Order items')}
      verboseName={translate('Order items')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      initialPageSize={5}
      expandableRow={OrderItemExpandableRow}
      hoverableRow={OrderItemActionsCell}
      fullWidth={true}
    />
  );
};
