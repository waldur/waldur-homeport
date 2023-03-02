import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ExpandableResourceSummary } from '@waldur/marketplace/resources/list/ExpandableResourceSummary';
import { PublicResourceActions } from '@waldur/marketplace/resources/list/PublicResourceActions';
import { ResourceMultiSelectAction } from '@waldur/marketplace/resources/mass-actions/ResourceMultiSelectAction';
import { Category, Offering } from '@waldur/marketplace/types';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import {
  getCustomer,
  getUser,
  isOwnerOrStaff,
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import {
  PUBLIC_RESOURCES_LIST_FILTER_FORM_ID,
  TABLE_PUBLIC_RESOURCE,
} from './constants';
import { PublicResourceLink } from './PublicResourceLink';
import { PublicResourcesListPlaceholder } from './PublicResourcesListPlaceholder';
import { ResourceStateField } from './ResourceStateField';

interface ResourceFilter {
  state?: any;
  organization?: Customer;
  category?: Category;
  offering?: Offering;
}

type StateProps = Readonly<ReturnType<typeof mapStateToProps>>;

export const TableComponent: FunctionComponent<any> = (props) => {
  React.useEffect(() => {
    props.resetPagination();
  }, [props.filter]);
  const columns = [
    {
      title: translate('Name'),
      render: ({ row }) => (
        <PublicResourceLink row={row} customer={props.customer} />
      ),
      orderField: 'name',
    },
    {
      title: translate('Offering type'),
      render: ({ row }) => <>{row.offering_name}</>,
    },
    {
      title: translate('Client organization'),
      render: ({ row }) => <>{row.customer_name}</>,
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
      title: translate('Plan'),
      render: ({ row }) => <>{row.plan_name || 'N/A'}</>,
    },
    {
      title: translate('Limits'),
      render: ({ row }) => JSON.stringify(row.limits, null, 4) || 'N/A',
    },
    {
      title: translate('Effective ID'),
      render: ({ row }) => <>{row.effective_id || 'N/A'}</>,
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
  ];

  return (
    <Table
      {...props}
      placeholderComponent={<PublicResourcesListPlaceholder />}
      columns={columns}
      verboseName={translate('Resources')}
      title={translate('Resources')}
      enableExport={true}
      initialSorting={{ field: 'created', mode: 'desc' }}
      hasQuery={true}
      showPageSizeSelector={true}
      expandableRow={ExpandableResourceSummary}
      hoverableRow={({ row }) => (
        <PublicResourceActions resource={row} refetch={props.fetch} />
      )}
      filterVisible={true}
      enableMultiSelect={true}
      multiSelectActions={ResourceMultiSelectAction}
    />
  );
};

const mapPropsToFilter = (props: StateProps) => {
  const filter: Record<string, string | boolean> = {};

  // Public resources should only contain resources from billable offerings.
  filter.billable = true;

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
  if (props.isServiceManager && !props.isOwnerOrStaff) {
    filter.service_manager_uuid = props.user.uuid;
  }
  return filter;
};

const exportRow = (row) => [
  row.name,
  row.uuid,
  row.offering_name,
  row.customer_name,
  row.project_name,
  row.category_title,
  row.plan_name,
  JSON.stringify(row.limits),
  row.effective_id,
  formatDateTime(row.created),
  row.state,
];

const exportFields = [
  'Name',
  'Resource UUID',
  'Offering type',
  'Client organization',
  'Project',
  'Category',
  'Plan',
  'Limits',
  'Effective ID',
  'Created at',
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

const mapStateToProps = (state: RootState) => ({
  customer: getCustomer(state),
  filter: getFormValues(PUBLIC_RESOURCES_LIST_FILTER_FORM_ID)(
    state,
  ) as ResourceFilter,
  user: getUser(state),
  isServiceManager: isServiceManagerSelector(state),
  isOwnerOrStaff: isOwnerOrStaff(state),
});

const enhance = compose(
  connect<StateProps>(mapStateToProps),
  connectTable(TableOptions),
);

export const PublicResourcesList = enhance(
  TableComponent,
) as React.ComponentType<any>;
