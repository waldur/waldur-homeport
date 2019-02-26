import * as React from 'react';
import { connect } from 'react-redux';
import { Option } from 'react-select';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { translate } from '@waldur/i18n';
import { Category } from '@waldur/marketplace/types';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { getCustomer } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import { ResourceState } from '../types';
import { ResourceNameField } from './ResourceNameField';
import { ResourceStateField } from './ResourceStateField';

interface ResourceFilter {
  state?: Option<ResourceState>;
  organization?: Customer;
  category?: Category;
}

interface StateProps {
  customer: Customer;
  filter: ResourceFilter;
}

export const TableComponent = props => {
  const columns = [
    {
      title: translate('Name'),
      render: ResourceNameField,
    },
    {
      title: translate('Client organization'),
      render: ({ row }) => <span>{row.customer_name}</span>,
    },
    {
      title: translate('Category'),
      render: ({ row }) => <span>{row.category_title}</span>,
    },
    {
      title: translate('State'),
      render: ResourceStateField,
    },
    {
      title: translate('Plan'),
      render: ({ row }) => <span>{row.plan_name || 'N/A'}</span>,
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('Resources')}
    />
  );
};

const mapPropsToFilter = (props: StateProps) => {
  const filter: Record<string, string> = {};
  if (props.customer) {
    filter.provider_uuid = props.customer.uuid;
  }
  if (props.filter) {
    if (props.filter.state) {
      filter.state = props.filter.state.value;
    }
    if (props.filter.organization) {
      filter.customer_uuid = props.filter.organization.uuid;
    }
    if (props.filter.category) {
      filter.category_uuid = props.filter.category.uuid;
    }
  }
  return filter;
};

const exportRow = row => [
  row.attributes.name,
  row.customer_name,
  row.category_title,
  row.state,
  row.plan_name,
];

const exportFields = [
  'Name',
  'Client organization',
  'Category',
  'State',
  'Plan',
];

const TableOptions = {
  table: 'PublicResourcesList',
  fetchData: createFetcher('marketplace-resources'),
  mapPropsToFilter,
  exportRow,
  exportFields,
};

const mapStateToProps = state => ({
  customer: getCustomer(state),
  filter: getFormValues('PublicResourcesFilter')(state),
});

const enhance = compose(
  connect<StateProps>(mapStateToProps),
  connectTable(TableOptions),
);

export const PublicResourcesList = enhance(TableComponent) as React.ComponentType<{}>;
