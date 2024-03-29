import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ExpandableResourceSummary } from '@waldur/marketplace/resources/list/ExpandableResourceSummary';
import { PublicResourceActions } from '@waldur/marketplace/resources/list/PublicResourceActions';
import { ResourceMultiSelectAction } from '@waldur/marketplace/resources/mass-actions/ResourceMultiSelectAction';
import { Category, Offering } from '@waldur/marketplace/types';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import {
  getCustomer,
  getUser,
  isOwnerOrStaff,
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';
import { Customer, Project } from '@waldur/workspace/types';

import {
  PUBLIC_RESOURCES_LIST_FILTER_FORM_ID,
  TABLE_PUBLIC_RESOURCE,
} from './constants';
import { PublicResourceLink } from './PublicResourceLink';
import { PublicResourcesFilter } from './PublicResourcesFilter';
import { PublicResourcesLimits } from './PublicResourcesLimits';
import { PublicResourcesListPlaceholder } from './PublicResourcesListPlaceholder';
import { ResourceStateField } from './ResourceStateField';

interface ResourceFilter {
  state?: any;
  organization?: Customer;
  project?: Project;
  category?: Category;
  offering?: Offering;
}

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
      render: PublicResourcesLimits,
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
  exportRow,
  exportFields,
  queryField: 'query',
};

export const mapPropsToFilter = createSelector(
  getCustomer,
  getUser,
  isServiceManagerSelector,
  isOwnerOrStaff,
  (state, formId) => getFormValues(formId)(state),
  (customer, user, isServiceManager, ownerOrStaff, filters: ResourceFilter) => {
    const filter: Record<string, string | boolean> = {};

    // Public resources should only contain resources from billable offerings.
    filter.billable = true;

    if (customer) {
      filter.provider_uuid = customer.uuid;
    }
    if (filters) {
      if (filters.offering) {
        filter.offering_uuid = filters.offering.uuid;
      }
      if (filters.state) {
        filter.state = filters.state.map((option) => option.value);
      }
      if (filters.organization) {
        filter.customer_uuid = filters.organization.uuid;
      }
      if (filters.project) {
        filter.project_uuid = filters.project.uuid;
      }
      if (filters.category) {
        filter.category_uuid = filters.category.uuid;
      }
    }
    if (isServiceManager && !ownerOrStaff) {
      filter.service_manager_uuid = user.uuid;
    }
    return filter;
  },
);

export const PublicResourcesList: React.ComponentType<any> = () => {
  const filter = useSelector((state) =>
    mapPropsToFilter(state, PUBLIC_RESOURCES_LIST_FILTER_FORM_ID),
  );
  const tableProps = useTable({
    ...TableOptions,
    filter,
  });
  return <TableComponent {...tableProps} filters={<PublicResourcesFilter />} />;
};
