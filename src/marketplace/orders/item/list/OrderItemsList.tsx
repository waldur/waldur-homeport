import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { renderFieldOrDash } from '@waldur/table-react/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { ResourceNameField } from './ResourceNameField';
import { RowNameField } from './RowNameField';

export const TableComponent = props => {
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
      title: translate('Client organization'),
      render: ({ row }) => row.customer_name,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
      orderField: 'created',
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
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('Order items')}
      initialSorting={{field: 'created', mode: 'desc'}}
    />
  );
};

const TableOptions = {
  table: 'OrderItemList',
  fetchData: createFetcher('marketplace-order-items'),
  mapPropsToFilter: props => {
    const filter: Record<string, string> = {provider_uuid: props.customer.uuid};
    if (props.filter) {
      if (props.filter.offering) {
        filter.offering_uuid = props.filter.offering.uuid;
      }
      if (props.filter.organization) {
        filter.customer_uuid = props.filter.organization.uuid;
      }
      if (props.filter.provider) {
        filter.provider_uuid = props.filter.provider.customer_uuid;
      }
      if (props.filter.state) {
        filter.state = props.filter.state.value;
      }
    }
    return filter;
  },
};

const mapStateToProps = state => ({
  filter: getFormValues('OrderItemFilter')(state),
  customer: getCustomer(state),
});

const enhance = compose(
  connect(mapStateToProps),
  connectTable(TableOptions),
);

export const OrderItemsList = enhance(TableComponent);
