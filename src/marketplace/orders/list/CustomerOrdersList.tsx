import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

import { OrderStateCell } from './OrderStateCell';

export const TableComponent: FunctionComponent<any> = (props) => {
  const columns = [
    {
      title: translate('Name'),
      render: ({ row }) => (
        <Link
          state="marketplace-order-details-project"
          params={{ order_uuid: row.uuid }}
          label={row.attributes.name}
        />
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
    />
  );
};

const TableOptions = {
  table: 'ordersList',
  fetchData: createFetcher('marketplace-orders'),
  mapPropsToFilter: (props) =>
    props.project && props.$state$.parent === 'project'
      ? { project_uuid: props.project.uuid }
      : { customer_uuid: props.customer.uuid },
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
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

export const CustomerOrdersList = enhance(TableComponent);
