import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { ResourceUsageButton } from '@waldur/marketplace/resources/usage/ResourceUsageButton';
import { connectTable, createFetcher, Table } from '@waldur/table-react';
import { renderFieldOrDash } from '@waldur/table-react/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { RowNameField } from './RowNameField';

const TableComponent = props => {
  const columns = [
    {
      title: translate('Offering'),
      render: RowNameField,
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
      render: ResourceUsageButton,
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('Order items')}
    />
  );
};

const mapPropsToFilter = props => {
  const filter: Record<string, string> = {};
  if (props.customer) {
    filter.customer_uuid = props.customer.uuid;
  }
  if (props.filter) {
    if (props.filter.state) {
      filter.state = props.filter.state.value;
    }
    if (props.filter.project) {
      filter.project_uuid = props.filter.project.uuid;
    }
  }
  return filter;
};

const TableOptions = {
  table: 'MyOrderItemList',
  fetchData: createFetcher('marketplace-order-items'),
  mapPropsToFilter,
};

const mapStateToProps = state => ({
  filter: getFormValues('MyOrderItemsFilter')(state),
  customer: getCustomer(state),
});

const enhance = compose(
  connect(mapStateToProps),
  connectTable(TableOptions),
);

export const MyOrderItemsList = enhance(TableComponent);
