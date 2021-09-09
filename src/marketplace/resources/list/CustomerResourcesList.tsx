import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import {
  CUSTOMER_RESOURCES_FILTER_FORM_ID,
  RESOURCE_STATES,
} from '@waldur/marketplace/resources/list/constants';
import { ResourceShowUsageButton } from '@waldur/marketplace/resources/usage/ResourceShowUsageButton';
import { Category } from '@waldur/marketplace/types';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { getCustomer } from '@waldur/workspace/selectors';
import { Customer, Project } from '@waldur/workspace/types';

import { CustomerResourcesListPlaceholder } from './CustomerResourcesListPlaceholder';
import { ResourceNameField } from './ResourceNameField';
import { ResourceStateField } from './ResourceStateField';

interface ResourceFilter {
  state?: any;
  project?: Project;
  category?: Category;
}

interface StateProps {
  customer: Customer;
  filter: ResourceFilter;
}

export const TableComponent: FunctionComponent<any> = (props) => {
  const columns = [
    {
      title: translate('Name'),
      render: ResourceNameField,
      orderField: 'name',
    },
    {
      title: translate('Project'),
      render: ({ row }) => <>{row.project_name}</>,
    },
    {
      title: translate('Category'),
      render: ({ row }) => <>{row.category_title}</>,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => <>{formatDateTime(row.created)}</>,
      orderField: 'created',
    },
    {
      title: translate('State'),
      render: ResourceStateField,
    },
    {
      title: translate('Plan'),
      render: ({ row }) => <>{row.plan_name || 'N/A'}</>,
    },
    {
      title: translate('Actions'),
      render: ({ row }) =>
        row.is_usage_based && <ResourceShowUsageButton resource={row} />,
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      placeholderComponent={<CustomerResourcesListPlaceholder />}
      verboseName={translate('Resources')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      enableExport={true}
      hasQuery={true}
      showPageSizeSelector={true}
    />
  );
};

const mapPropsToFilter = (props: StateProps) => {
  const filter: Record<string, string | string[]> = {
    state: RESOURCE_STATES,
  };
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
    if (props.filter.category) {
      filter.category_uuid = props.filter.category.uuid;
    }
  }
  return filter;
};

const exportRow = (row) => [
  row.name,
  row.project_name,
  row.category_title,
  row.state,
  row.plan_name,
];

const exportFields = ['Name', 'Project', 'Category', 'State', 'Plan'];

const TableOptions = {
  table: 'CustomerResourcesList',
  fetchData: createFetcher('marketplace-resources'),
  mapPropsToFilter,
  exportRow,
  exportFields,
  queryField: 'query',
};

const mapStateToProps = (state: RootState) => ({
  customer: getCustomer(state),
  filter: getFormValues(CUSTOMER_RESOURCES_FILTER_FORM_ID)(state),
});

const enhance = compose(
  connect<StateProps>(mapStateToProps),
  connectTable(TableOptions),
);

export const CustomerResourcesList = enhance(TableComponent);
