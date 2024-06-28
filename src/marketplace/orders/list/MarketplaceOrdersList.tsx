import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import {
  MARKETPLACE_ORDERS_LIST_FILTER_FORM_ID,
  TABLE_MARKETPLACE_ORDERS,
} from '@waldur/marketplace/orders/list/constants';
import { useMarketplacePublicTabs } from '@waldur/marketplace/utils';
import { createFetcher, Table } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { useTable } from '@waldur/table/utils';

import { OrderProviderActions } from '../actions/OrderProviderActions';

import { MarketplaceOrdersListFilter } from './MarketplaceOrdersListFilter';
import { OrdersListExpandableRow } from './OrdersListExpandableRow';
import { OrderTablePlaceholder } from './OrderTablePlaceholder';

export const MarketplaceOrdersList: FunctionComponent = () => {
  const filter = useSelector(mapStateToFilter);
  const props = useTable({
    table: TABLE_MARKETPLACE_ORDERS,
    fetchData: createFetcher('marketplace-orders'),
    filter,
    exportFields,
    exportRow,
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
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
      orderField: 'created',
      keys: ['created'],
    },
    {
      title: translate('Created by'),
      render: ({ row }) => row.created_by_full_name || row.created_by_username,
      keys: ['created_by_full_name', 'created_by_username'],
    },
    {
      title: translate('State'),
      render: ({ row }) => row.state,
      orderField: 'state',
      keys: ['state'],
    },
    {
      title: translate('Project'),
      render: ({ row }) => row.project_name,
      keys: ['project_name'],
    },
    {
      title: translate('Client organization'),
      render: ({ row }) => row.customer_name,
      keys: ['customer_name'],
    },
    {
      title: translate('Approved at'),
      render: ({ row }) =>
        row.consumer_reviewed_at
          ? formatDateTime(row.consumer_reviewed_at)
          : DASH_ESCAPE_CODE,
      orderField: 'consumer_reviewed_at',
      keys: ['consumer_reviewed_at'],
    },
    {
      title: translate('Approved by'),
      render: ({ row }) =>
        row.consumer_reviewed_by_full_name ||
        row.consumer_reviewed_by_username ||
        DASH_ESCAPE_CODE,
      keys: ['consumer_reviewed_by_full_name', 'consumer_reviewed_by_username'],
    },
  ];

  useMarketplacePublicTabs();

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
      filters={<MarketplaceOrdersListFilter />}
      hoverableRow={({ row }) => (
        <OrderProviderActions row={row} refetch={props.fetch} />
      )}
      hasOptionalColumns
      standalone
    />
  );
};

const exportRow = (row) => [
  formatDateTime(row.created),
  row.created_by_full_name || row.created_by_username,
  row.state,
  row.consumer_reviewed_at
    ? formatDateTime(row.consumer_reviewed_at)
    : DASH_ESCAPE_CODE,
  row.consumer_reviewed_by_full_name ||
    row.consumer_reviewed_by_username ||
    DASH_ESCAPE_CODE,
];

const exportFields = [
  'Created at',
  'Created by',
  'State',
  'Approved at',
  'Approved by',
];

const mapStateToFilter = createSelector(
  getFormValues(MARKETPLACE_ORDERS_LIST_FILTER_FORM_ID),
  (filterValues: any) => {
    const filter: Record<string, string> = {};
    if (filterValues) {
      if (filterValues.organization) {
        filter.customer_uuid = filterValues.organization.uuid;
      }
      if (filterValues.project) {
        filter.project_uuid = filterValues.project.uuid;
      }
      if (filterValues.state) {
        filter.state = filterValues.state.value;
      }
      if (filterValues.type) {
        filter.type = filterValues.type.value;
      }
      if (filterValues.offering) {
        filter.offering_uuid = filterValues.offering.uuid;
      }
      if (filterValues.provider) {
        filter.provider_uuid = filterValues.provider.customer_uuid;
      }
    }
    return filter;
  },
);
