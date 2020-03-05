import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { connectTable, createFetcher, Table } from '@waldur/table-react';
import { renderFieldOrDash } from '@waldur/table-react/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { TABLE_MY_ORDERS } from './constants';
import { OrderItemslistTablePlaceholder } from './OrderItemsListPlaceholder';
import { ResourceNameField } from './ResourceNameField';
import { RowNameField } from './RowNameField';
import { ShowRequestButton } from './ShowRequestButton';

const TableComponent = props => {
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
      title: translate('Project'),
      render: ({ row }) => row.project_name,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
    },
    {
      title: translate('Type'),
      render: ({ row }) => row.type,
    },
    {
      title: translate('State'),
      render: ({ row }) => row.state,
    },
    {
      title: translate('Plan'),
      render: ({ row }) => renderFieldOrDash(row.plan_name),
    },
    {
      title: translate('Cost'),
      render: ({ row }) => defaultCurrency(row.cost),
    },
    {
      title: translate('Actions'),
      render: ShowRequestButton,
    },
  ];

  return (
    <Table
      {...props}
      placeholderComponent={<OrderItemslistTablePlaceholder />}
      columns={columns}
      initialSorting={{ field: 'created', mode: 'desc' }}
      showPageSizeSelector={true}
      verboseName={translate('Order items')}
      enableExport={true}
    />
  );
};

const mapPropsToFilter = props => {
  const filter: Record<string, string> = { o: '-created' };
  if (props.customer) {
    filter.customer_uuid = props.customer.uuid;
  }
  if (props.filter) {
    if (props.filter.state) {
      filter.state = props.filter.state.value;
    }
    if (props.filter.type) {
      filter.type = props.filter.type.value;
    }
    if (props.filter.project) {
      filter.project_uuid = props.filter.project.uuid;
    }
  }
  return filter;
};

const exportRow = row => [
  row.offering_name,
  row.project_name,
  formatDateTime(row.created),
  row.type,
  row.state,
  renderFieldOrDash(row.plan_name),
  defaultCurrency(row.cost || 0),
];

const exportFields = [
  'Offering',
  'Project',
  'Created at',
  'Type',
  'State',
  'Plan',
  'Cost',
];

const TableOptions = {
  table: TABLE_MY_ORDERS,
  fetchData: createFetcher('marketplace-order-items'),
  mapPropsToFilter,
  exportRow,
  exportFields,
};

const mapStateToProps = state => ({
  filter: getFormValues('MyOrderItemsFilter')(state),
  customer: getCustomer(state),
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

export const MyOrderItemsList = enhance(TableComponent);
