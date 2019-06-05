import * as React from 'react';
import { connect } from 'react-redux';
import { Option } from 'react-select';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Category, Offering } from '@waldur/marketplace/types';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { getCustomer } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import { ResourceState } from '../types';
import { ResourceUsageButton } from '../usage/ResourceUsageButton';
import { TABLE_PUBLIC_RESOURCE } from './constants';
import { PublicResourcesListPlaceholder } from './PublicResourcesListPlaceholder';
import { ResourceNameField } from './ResourceNameField';
import { ResourceStateField } from './ResourceStateField';

interface ResourceFilter {
  state?: Option<ResourceState>;
  organization?: Customer;
  category?: Category;
  offering?: Offering;
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
      orderField: 'name',
    },
    {
      title: translate('Resource UUID'),
      render: ({ row }) => <span>{row.uuid}</span>,
    },
    {
      title: translate('Offering type'),
      render: ({ row }) => <span>{row.offering_name}</span>,
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
      title: translate('Plan'),
      render: ({ row }) => <span>{row.plan_name || 'N/A'}</span>,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
      orderField: 'created',
    },
    {
      title: translate('State'),
      render: ResourceStateField,
    },
    {
      title: translate('Actions'),
      render: ResourceUsageButton,
    },
  ];

  return (
    <Table
      {...props}
      placeholderComponent={<PublicResourcesListPlaceholder/>}
      columns={columns}
      verboseName={translate('Resources')}
      enableExport={true}
      initialSorting={{field: 'created', mode: 'desc'}}
      hasQuery={true}
      showPageSizeSelector={true}
    />
  );
};

const mapPropsToFilter = (props: StateProps) => {
  const filter: Record<string, string> = {};
  if (props.customer) {
    filter.provider_uuid = props.customer.uuid;
  }
  if (props.filter) {
    if (props.filter.offering) {
      filter.offering_uuid = props.filter.offering.uuid;
    }
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
  row.name,
  row.uuid,
  row.offering_name,
  row.customer_name,
  row.category_title,
  row.plan_name,
  row.state,
];

const exportFields = [
  'Name',
  'Resource UUID',
  'Offering type',
  'Client organization',
  'Category',
  'Plan',
  'State',
];

export const TableOptions = {
  table: TABLE_PUBLIC_RESOURCE,
  fetchData: createFetcher('marketplace-resources'),
  mapPropsToFilter,
  exportRow,
  exportFields,
  queryField: 'query',
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
