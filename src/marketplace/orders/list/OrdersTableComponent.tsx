import { FC, useMemo } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { createFetcher, Table } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { TableProps } from '@waldur/table/Table';
import { useTable } from '@waldur/table/utils';

import { OrderProviderActions } from '../actions/OrderProviderActions';

import { OrdersListExpandableRow } from './OrdersListExpandableRow';
import { OrderTablePlaceholder } from './OrderTablePlaceholder';

interface OrdersTableComponentProps extends Partial<TableProps> {
  table: string;
  hideColumns?: 'organization'[];
}

export const OrdersTableComponent: FC<OrdersTableComponentProps> = ({
  table,
  filter,
  hideColumns = [],
  ...rest
}) => {
  const tableFilter = useMemo(() => {
    return {
      field: [
        'uuid',
        'project_description',
        'resource_name',
        'type',
        'plan_name',
        'offering_name',
      ],
      ...filter,
    };
  }, [filter]);
  const props = useTable({
    table,
    fetchData: createFetcher('marketplace-orders'),
    filter: tableFilter,
    queryField: 'query',
  });
  const columns = [
    {
      title: translate('Name'),
      render: ({ row }) => (
        <Link
          state="marketplace-orders.details"
          params={{ order_uuid: row.uuid }}
          label={row.attributes.name}
        />
      ),
      keys: ['attributes'],
      id: 'name',
      export: (row) => row.attributes.name,
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
      keys: ['created_by_full_name', 'created_by_username'],
      id: 'created_by',
      export: (row) => row.created_by_full_name || row.created_by_username,
    },
    {
      title: translate('State'),
      render: ({ row }) => row.state,
      orderField: 'state',
      keys: ['state'],
      filter: 'state',
      id: 'state',
    },
    {
      title: translate('Project'),
      render: ({ row }) => row.project_name,
      keys: ['project_name'],
      filter: 'project',
      id: 'project',
    },
    !hideColumns.includes('organization') && {
      title: translate('Client organization'),
      render: ({ row }) => row.customer_name,
      keys: ['customer_name'],
      filter: 'organization',
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
  ].filter(Boolean);

  return (
    <Table
      {...props}
      columns={columns}
      placeholderComponent={<OrderTablePlaceholder />}
      verboseName={translate('Orders')}
      hasQuery={true}
      showPageSizeSelector={true}
      initialSorting={{ field: 'created', mode: 'desc' }}
      enableExport={true}
      expandableRow={OrdersListExpandableRow}
      rowActions={({ row }) => (
        <OrderProviderActions row={row} refetch={props.fetch} />
      )}
      hasOptionalColumns
      {...rest}
    />
  );
};
