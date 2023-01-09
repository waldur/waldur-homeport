import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import {
  SUPPORT_ORDERS_LIST_FILTER_FORM_ID,
  TABLE_SUPPORT_ORDERS,
} from '@waldur/marketplace/orders/item/list/constants';
import { OrdersListExpandableRow } from '@waldur/marketplace/orders/OrdersListExpandableRow';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

import { OrderNameColumn } from '../../OrderNameColumn';

const TableComponent: FunctionComponent<any> = (props) => {
  const columns = [
    {
      title: translate('Name'),
      render: OrderNameColumn,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => (
        <Link
          state="marketplace-order-details"
          params={{ order_uuid: row.uuid, uuid: row.project_uuid }}
          label={formatDateTime(row.created)}
        />
      ),
      orderField: 'created',
    },
    {
      title: translate('Created by'),
      render: ({ row }) => row.created_by_full_name || row.created_by_username,
    },
    {
      title: translate('State'),
      render: ({ row }) => row.state,
      orderField: 'state',
    },
    {
      title: translate('Project'),
      render: ({ row }) => row.project_name,
    },
    {
      title: translate('Client organization'),
      render: ({ row }) => row.customer_name,
    },
    {
      title: translate('Approved at'),
      render: ({ row }) =>
        row.approved_at ? formatDateTime(row.approved_at) : DASH_ESCAPE_CODE,
    },
    {
      title: translate('Approved by'),
      render: ({ row }) =>
        row.approved_by_full_name ||
        row.approved_by_username ||
        DASH_ESCAPE_CODE,
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
    />
  );
};

const mapPropsToFilter = (props) => {
  const filter: Record<string, string> = {};
  if (props.filter) {
    if (props.filter.organization) {
      filter.customer_uuid = props.filter.organization.uuid;
    }
    if (props.filter.project) {
      filter.project_uuid = props.filter.project.uuid;
    }
    if (props.filter.state) {
      filter.state = props.filter.state.value;
    }
  }
  return filter;
};

const TableOptions = {
  table: TABLE_SUPPORT_ORDERS,
  fetchData: createFetcher('marketplace-orders'),
  mapPropsToFilter,
  exportRow: (row) => [
    formatDateTime(row.created),
    row.created_by_full_name || row.created_by_username,
    row.state,
    row.approved_at ? formatDateTime(row.approved_at) : DASH_ESCAPE_CODE,
    row.row.approved_by_full_name ||
      row.approved_by_username ||
      DASH_ESCAPE_CODE,
  ],
  exportFields: [
    'Created at',
    'Created by',
    'State',
    'Approved at',
    'Approved by',
  ],
};

const mapStateToProps = (state: RootState) => ({
  filter: getFormValues(SUPPORT_ORDERS_LIST_FILTER_FORM_ID)(state) as FormData,
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

export const SupportOrdersList = enhance(
  TableComponent,
) as React.ComponentType<any>;
