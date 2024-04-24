import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { formatDateTime } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { useTable } from '@waldur/table/utils';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

import { OrderDetailsLink } from '../details/OrderDetailsLink';

import { CUSTOMER_ORDERS_LIST_FILTER_FORM_ID } from './constants';
import { CustomerOrdersListFilter } from './CustomerOrdersListFilter';
import { OrderStateCell } from './OrderStateCell';

export const CustomerOrdersList: FunctionComponent = () => {
  const filter = useSelector(mapStateToFilter);
  const props = useTable({
    table: 'ordersList',
    fetchData: createFetcher('marketplace-orders'),
    filter,
    exportRow,
    exportFields,
  });
  const { state } = useCurrentStateAndParams();
  const columns = [
    {
      title: translate('Name'),
      render: ({ row }) => (
        <OrderDetailsLink
          order_uuid={row.uuid}
          customer_uuid={row.customer_uuid}
          project_uuid={row.project_uuid}
        >
          {row.attributes.name || 'N/A'}
        </OrderDetailsLink>
      ),
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
      orderField: 'created',
    },
    {
      title: translate('Created by'),
      render: ({ row }) => row.created_by_full_name || row.created_by_username,
    },
    {
      title: translate('State'),
      render: OrderStateCell,
      orderField: 'state',
    },
    {
      title: translate('Approved at'),
      render: ({ row }) =>
        row.consumer_reviewed_at
          ? formatDateTime(row.consumer_reviewed_at)
          : DASH_ESCAPE_CODE,
      orderField: 'consumer_reviewed_at',
    },
    {
      title: translate('Approved by'),
      render: ({ row }) =>
        row.consumer_reviewed_by_full_name ||
        row.consumer_reviewed_by_username ||
        DASH_ESCAPE_CODE,
    },
    {
      title: translate('Cost'),
      render: ({ row }) => defaultCurrency(row.cost || 0),
      orderField: 'cost',
    },
  ];

  if (state.parent !== 'project') {
    columns.splice(3, 0, {
      title: translate('Project'),
      render: ({ row }) => row.project_name,
    });
  }

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('Orders')}
      hasQuery={true}
      showPageSizeSelector={true}
      initialSorting={{ field: 'created', mode: 'desc' }}
      enableExport={true}
      filters={<CustomerOrdersListFilter />}
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
  row.cost,
];

const exportFields = [
  'Created at',
  'Created by',
  'State',
  'Approved at',
  'Approved by',
  'Cost',
];

const mapStateToFilter = createSelector(
  getProject,
  getCustomer,
  getFormValues(CUSTOMER_ORDERS_LIST_FILTER_FORM_ID),
  (project, customer, filterValues: any) => {
    const filter: Record<string, string> = {};

    if (project) {
      filter.project_uuid = project.uuid;
    } else {
      filter.customer_uuid = customer.uuid;
    }

    if (filterValues) {
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
