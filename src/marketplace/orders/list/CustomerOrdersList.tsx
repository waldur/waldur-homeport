import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

import { OrderDetailsLink } from '../details/OrderDetailsLink';

import { CUSTOMER_ORDERS_LIST_FILTER_FORM_ID } from './constants';
import { CustomerOrdersListFilter } from './CustomerOrdersListFilter';
import { OrderStateCell } from './OrderStateCell';

export const TableComponent: FunctionComponent<any> = (props) => {
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

  if (props.$state$.parent !== 'project') {
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
      filters={<CustomerOrdersListFilter parentState={props.$state$.parent} />}
    />
  );
};

const mapPropsToFilter = (props) => {
  const filter: Record<string, string> = {};

  if (props.project && props.$state$.parent === 'project') {
    filter.project_uuid = props.project.uuid;
  } else {
    filter.customer_uuid = props.customer.uuid;
  }

  if (props.filter) {
    if (props.filter.project) {
      filter.project_uuid = props.filter.project.uuid;
    }
    if (props.filter.state) {
      filter.state = props.filter.state.value;
    }
    if (props.filter.type) {
      filter.type = props.filter.type.value;
    }
    if (props.filter.offering) {
      filter.offering_uuid = props.filter.offering.uuid;
    }
  }

  return filter;
};

const TableOptions = {
  table: 'ordersList',
  fetchData: createFetcher('marketplace-orders'),
  mapPropsToFilter,
  exportRow: (row) => [
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
  ],
  exportFields: [
    'Created at',
    'Created by',
    'State',
    'Approved at',
    'Approved by',
    'Cost',
  ],
};

const mapStateToProps = (state: RootState) => ({
  project: getProject(state),
  customer: getCustomer(state),
  filter: getFormValues(CUSTOMER_ORDERS_LIST_FILTER_FORM_ID)(state) as FormData,
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

export const CustomerOrdersList = enhance(TableComponent);
