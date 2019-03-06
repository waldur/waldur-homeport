import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { defaultCurrency } from '@waldur/core/services';
import { withTranslation } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { getProject } from '@waldur/workspace/selectors';

export const TableComponent = props => {
  const { translate } = props;
  const columns = [
    {
      title: translate('Created at'),
      render: ({ row }) => (
        <Link
          state="marketplace-order-details"
          params={{ order_uuid: row.uuid }}
          label={formatDateTime(row.created)}
        />
      ),
      orderField: 'created',
    },
    {
      title: translate('Created by'),
      render: ({ row }) => row.created_by_full_name ||  row.created_by_username,
    },
    {
      title: translate('State'),
      render: ({ row }) => row.state,
      orderField: 'state',
    },
    {
      title: translate('Approved at'),
      render: ({ row }) => row.approved_at ? formatDateTime(row.approved_at) : '\u2014',
    },
    {
      title: translate('Approved by'),
      render: ({ row }) => row.approved_by_full_name ||  row.approved_by_username || '\u2014',
    },
    {
      title: translate('Cost'),
      render: ({ row }) => defaultCurrency(row.total_cost || 0),
      orderField: 'total_cost',
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('Orders')}
      hasQuery={true}
      showPageSizeSelector={true}
      initialSorting={{field: 'created', mode: 'desc'}}
      enableExport={true}
    />
  );
};

const TableOptions = {
  table: 'ordersList',
  fetchData: createFetcher('marketplace-orders'),
  mapPropsToFilter: props => ({project_uuid: props.project.uuid}),
  exportRow: row => [
    formatDateTime(row.created),
    row.created_by_full_name ||  row.created_by_username,
    row.state,
    row.approved_at ? formatDateTime(row.approved_at) : '\u2014',
    row.row.approved_by_full_name ||  row.approved_by_username || '\u2014',
    row.total_cost,
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

const mapStateToProps = state => ({
  project: getProject(state),
});

const enhance = compose(
  connect(mapStateToProps),
  connectTable(TableOptions),
  withTranslation,
);

export const CustomerList = enhance(TableComponent);

export default connectAngularComponent(CustomerList);
