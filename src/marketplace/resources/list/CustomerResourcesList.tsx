import * as classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import { Option } from 'react-select';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ResourceShowUsageButton } from '@waldur/marketplace/resources/usage/ResourceShowUsageButton';
import { Category } from '@waldur/marketplace/types';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { wrapTooltip } from '@waldur/table-react/ActionButton';
import { getCustomer } from '@waldur/workspace/selectors';
import { Customer, Project } from '@waldur/workspace/types';

import { ResourceState } from '../types';
import { CustomerResourcesListPlaceholder } from './CustomerResourcesListPlaceholder';
import { ResourceNameField } from './ResourceNameField';
import { ResourceStateField } from './ResourceStateField';

interface ResourceFilter {
  state?: Option<ResourceState>;
  project?: Project;
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
      orderField: 'name',
    },
    {
      title: translate('Project'),
      render: ({ row }) => <span>{row.project_name}</span>,
    },
    {
      title: translate('Category'),
      render: ({ row }) => <span>{row.category_title}</span>,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => <span>{formatDateTime(row.created)}</span>,
      orderField: 'created',
    },
    {
      title: translate('State'),
      render: ResourceStateField,
    },
    {
      title: translate('Plan'),
      render: ({ row }) => <span>{row.plan_name || 'N/A'}</span>,
    },
    {
      title: translate('Actions'),
      render: ({ row }) => {
        const body = (
          <div className={classNames({disabled: !row.is_usage_based})}>
            <ResourceShowUsageButton resource={row.uuid}/>
          </div>
        );
        if (!row.is_usage_based) {
          return wrapTooltip(translate('Usage information is not available.'), body);
        } else {
          return body;
        }
      },
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      placeholderComponent={<CustomerResourcesListPlaceholder/>}
      verboseName={translate('Resources')}
      initialSorting={{field: 'created', mode: 'desc'}}
      enableExport={true}
      hasQuery={true}
      showPageSizeSelector={true}
    />
  );
};

const mapPropsToFilter = (props: StateProps) => {
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
    if (props.filter.category) {
      filter.category_uuid = props.filter.category.uuid;
    }
  }
  return filter;
};

const exportRow = row => [
  row.name,
  row.project_name,
  row.category_title,
  row.state,
  row.plan_name,
];

const exportFields = [
  'Name',
  'Project',
  'Category',
  'State',
  'Plan',
];

const TableOptions = {
  table: 'CustomerResourcesList',
  fetchData: createFetcher('marketplace-resources'),
  mapPropsToFilter,
  exportRow,
  exportFields,
  queryField: 'name',
};

const mapStateToProps = state => ({
  customer: getCustomer(state),
  filter: getFormValues('CustomerResourcesFilter')(state),
});

const enhance = compose(
  connect<StateProps>(mapStateToProps),
  connectTable(TableOptions),
);

export const CustomerResourcesList = enhance(TableComponent) as React.ComponentType<{}>;
