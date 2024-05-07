import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import {
  SUPPORT_ORDERS_LIST_FILTER_FORM_ID,
  TABLE_SUPPORT_ORDERS,
} from '@waldur/marketplace/orders/list/constants';
import { Table, createFetcher } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { useTable } from '@waldur/table/utils';

import { OrdersListExpandableRow } from './OrdersListExpandableRow';
import { SupportOrdersListFilter } from './SupportOrdersListFilter';

export const SupportOrdersList: FunctionComponent = () => {
  const filter = useSelector(mapStateToFilter);
  const props = useTable({
    table: TABLE_SUPPORT_ORDERS,
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
          state="marketplace-order-details-project"
          params={{ order_uuid: row.uuid, uuid: row.project_uuid }}
          label={row.attributes.name}
        />
      ),
      key: 'title',
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
      orderField: 'created',
      key: 'created_at',
    },
    {
      title: translate('Created by'),
      render: ({ row }) => row.created_by_full_name || row.created_by_username,
      key: 'created_by',
    },
    {
      title: translate('State'),
      render: ({ row }) => row.state,
      orderField: 'state',
      key: 'state',
    },
    {
      title: translate('Project'),
      render: ({ row }) => row.project_name,
      key: 'project_name',
    },
    {
      title: translate('Client organization'),
      render: ({ row }) => row.customer_name,
      key: 'customer_name',
    },
    {
      title: translate('Approved at'),
      render: ({ row }) =>
        row.consumer_reviewed_at
          ? formatDateTime(row.consumer_reviewed_at)
          : DASH_ESCAPE_CODE,
      orderField: 'consumer_reviewed_at',
      key: 'approved_at',
    },
    {
      title: translate('Approved by'),
      render: ({ row }) =>
        row.consumer_reviewed_by_full_name ||
        row.consumer_reviewed_by_username ||
        DASH_ESCAPE_CODE,
      key: 'approved_by',
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('Orders')}
      hasQuery={true}
      showPageSizeSelector={true}
      initialSorting={{ field: 'created', mode: 'desc' }}
      enableExport={true}
      expandableRow={OrdersListExpandableRow}
      filters={<SupportOrdersListFilter />}
      hasOptionalColumns
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
  getFormValues(SUPPORT_ORDERS_LIST_FILTER_FORM_ID),
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
    }
    return filter;
  },
);
