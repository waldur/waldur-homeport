import { FC } from 'react';
import { MarketplaceOrdersListData, OrderDetails } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { Column, TableProps } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { OrderProviderActions } from '../actions/OrderProviderActions';

import { getOrderStateFilterOptions } from './MarketplaceOrdersListFilter';
import { OrdersListExpandableRow } from './OrdersListExpandableRow';
import { OrderTablePlaceholderActions } from './OrderTablePlaceholderActions';
import { OrderTypeCell } from './OrderTypeCell';
import { getOrderTypeOptions } from './OrderTypeFilter';

interface OrdersTableComponentProps extends Partial<TableProps<OrderDetails>> {
  table: string;
  hideColumns?: 'organization'[];
  filter: MarketplaceOrdersListData['query'];
}

const mandatoryFields: MarketplaceOrdersListData['query']['field'] = [
  'uuid',
  // Row actions
  'state',
  // Expandable row
  'project_description',
  'customer_uuid',
  'project_uuid',
  'offering_name',
  'attributes',
  'resource_name',
  'type',
  'plan_name',
];

const formatName = (row: OrderDetails) =>
  typeof row.attributes['name'] === 'string' && row.attributes['name']
    ? row.attributes['name']
    : row.uuid;

export const OrdersTableComponent: FC<OrdersTableComponentProps> = ({
  table,
  filter,
  hideColumns = [],
  ...rest
}) => {
  const props = useTable({
    table,
    fetchData: createFetcher('marketplace-orders'),
    filter,
    queryField: 'query',
    mandatoryFields,
  });

  const columns: Array<Column<OrderDetails>> = [
    {
      title: translate('Name'),
      render: ({ row }) => (
        <Link
          state="marketplace-orders.details"
          params={{ order_uuid: row.uuid }}
          label={formatName(row)}
        />
      ),

      keys: ['attributes'],
      id: 'name',
      copyField: formatName,
      export: formatName,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
      orderField: 'created',
      keys: ['created'],
      id: 'created',
      export: (row) => formatDateTime(row.created),
    },
    {
      title: translate('Created by'),
      render: ({ row }) => row.created_by_full_name || row.created_by_username,
      keys: ['created_by_full_name', 'created_by_username'] as Array<
        keyof OrderDetails
      >,

      id: 'created_by',
      export: (row) => row.created_by_full_name || row.created_by_username,
    },
    {
      title: translate('State'),
      render: ({ row }) => row.state,
      orderField: 'state',
      keys: ['state'],
      filter: 'state',
      inlineFilter: (row) =>
        getOrderStateFilterOptions().find((op) => op.value === row.state),
      id: 'state',
    },
    {
      title: translate('Type'),
      render: OrderTypeCell,
      keys: ['type'],
      filter: 'type',
      inlineFilter: (row) =>
        getOrderTypeOptions().find((op) => op.value === row.type),
      id: 'type',
    },
    {
      title: translate('Project'),
      render: ({ row }) => row.project_name,
      keys: ['project_name'],
      filter: 'project',
      inlineFilter: (row) => ({
        name: row.project_name,
        uuid: row.project_uuid,
      }),
      id: 'project',
    },
    !hideColumns.includes('organization') && {
      title: translate('Client organization'),
      render: ({ row }) => row.customer_name,
      keys: ['customer_name'],
      filter: 'organization',
      inlineFilter: (row) => ({
        name: row.customer_name,
        uuid: row.customer_uuid,
      }),
      id: 'client_organization',
    },
    {
      title: translate('Approved at'),
      render: ({ row }) =>
        row.consumer_reviewed_at
          ? formatDateTime(row.consumer_reviewed_at)
          : DASH_ESCAPE_CODE,
      orderField: 'consumer_reviewed_at',
      keys: ['consumer_reviewed_at'],
      id: 'approved_at',
      export: (row) =>
        row.consumer_reviewed_at
          ? formatDateTime(row.consumer_reviewed_at)
          : DASH_ESCAPE_CODE,
    },
    {
      title: translate('Approved by'),
      render: ({ row }) =>
        row.consumer_reviewed_by_full_name ||
        row.consumer_reviewed_by_username ||
        DASH_ESCAPE_CODE,
      keys: ['consumer_reviewed_by_full_name', 'consumer_reviewed_by_username'],
      id: 'approved_by',
      export: (row) =>
        row.consumer_reviewed_by_full_name ||
        row.consumer_reviewed_by_username ||
        DASH_ESCAPE_CODE,
    },
  ];

  return (
    <Table<OrderDetails>
      {...props}
      columns={columns.filter(Boolean)}
      placeholderActions={<OrderTablePlaceholderActions />}
      verboseName={translate('Orders')}
      hasQuery={true}
      showPageSizeSelector={true}
      initialSorting={{ field: 'created', mode: 'desc' }}
      enableExport={true}
      expandableRow={OrdersListExpandableRow}
      rowActions={({ row }) => (
        <OrderProviderActions order={row} refetch={props.fetch} />
      )}
      hasOptionalColumns
      {...rest}
    />
  );
};
