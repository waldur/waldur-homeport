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
import { createFetcher, Table } from '@waldur/table';
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
import { ResourceStateField } from './ResourceStateField';
import { NON_TERMINATED_STATES } from './ResourceStateFilter';

interface ResourceFilter {
  state?: any;
  organization?: Customer;
  project?: Project;
  category?: Category;
  offering?: Offering;
  include_terminated?: boolean;
}

export const TableComponent: FunctionComponent<any> = (props) => {
  React.useEffect(() => {
    props.resetPagination();
  }, [props.filter]);
  const columns = [
    {
      title: translate('Name'),
      render: PublicResourceLink,
      orderField: 'name',
      export: 'name',
    },
    {
      visible: false,
      title: translate('Resource UUID'),
      render: null,
      export: 'uuid',
    },
    {
      title: translate('Offering type'),
      render: ({ row }) => <>{row.offering_name}</>,
      export: 'offering_name',
    },
    {
      title: translate('Client organization'),
      render: ({ row }) => <>{row.customer_name}</>,
      filter: 'organization',
      export: 'customer_name',
    },
    {
      title: translate('Project'),
      render: ({ row }) => <>{row.project_name}</>,
      export: 'project_name',
    },
    {
      title: translate('Category'),
      render: ({ row }) => <>{row.category_title}</>,
      filter: 'category',
      export: 'category_title',
    },
    {
      title: translate('Plan'),
      render: ({ row }) => <>{row.plan_name || 'N/A'}</>,
      export: 'plan_name',
    },
    {
      title: translate('Limits'),
      render: PublicResourcesLimits,
      export: (row) => JSON.stringify(row.limits),
      exportKeys: ['limits'],
    },
    {
      title: translate('Effective ID'),
      render: ({ row }) => <>{row.effective_id || 'N/A'}</>,
      export: 'effective_id',
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
      orderField: 'created',
      export: (row) => formatDateTime(row.created),
      exportKeys: ['created'],
    },
    {
      title: translate('State'),
      render: ({ row }) => <ResourceStateField resource={row} outline pill />,
      filter: 'state',
      export: 'state',
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('Resources')}
      title={translate('Resources')}
      enableExport={true}
      initialSorting={{ field: 'created', mode: 'desc' }}
      hasQuery={true}
      showPageSizeSelector={true}
      expandableRow={ExpandableResourceSummary}
      rowActions={({ row }) => (
        <PublicResourceActions resource={row} refetch={props.fetch} />
      )}
      enableMultiSelect={true}
      multiSelectActions={ResourceMultiSelectAction}
    />
  );
};

export const TableOptions = {
  table: TABLE_PUBLIC_RESOURCE,
  fetchData: createFetcher('marketplace-resources'),
  queryField: 'query',
};

export const mapStateToFilter = createSelector(
  getCustomer,
  getUser,
  isServiceManagerSelector,
  isOwnerOrStaff,
  (state, formId) => getFormValues(formId)(state),
  (customer, user, isServiceManager, ownerOrStaff, filters: ResourceFilter) => {
    const filter: Record<string, string | string[] | boolean> = {};

    // Public resources should only contain resources from billable offerings.
    filter.billable = true;

    if (customer) {
      filter.provider_uuid = customer.uuid;
    }
    if (filters?.offering) {
      filter.offering_uuid = filters.offering.uuid;
    }
    if (filters?.state) {
      filter.state = filters.state.map((option) => option.value) as string[];
      if (filters?.include_terminated) {
        filter.state = [...filter.state, 'Terminated'];
      }
    } else {
      if (!filters?.include_terminated) {
        filter.state = NON_TERMINATED_STATES.map((option) => option.value);
      }
    }
    if (filters?.organization) {
      filter.customer_uuid = filters.organization.uuid;
    }
    if (filters?.project) {
      filter.project_uuid = filters.project.uuid;
    }
    if (filters?.category) {
      filter.category_uuid = filters.category.uuid;
    }
    if (isServiceManager && !ownerOrStaff) {
      filter.service_manager_uuid = user.uuid;
    }
    return filter;
  },
);

export const PublicResourcesList: React.ComponentType<any> = () => {
  const filter = useSelector((state) =>
    mapStateToFilter(state, PUBLIC_RESOURCES_LIST_FILTER_FORM_ID),
  );
  const tableProps = useTable({
    ...TableOptions,
    filter,
  });
  return <TableComponent {...tableProps} filters={<PublicResourcesFilter />} />;
};
