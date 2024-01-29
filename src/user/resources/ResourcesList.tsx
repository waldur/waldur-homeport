import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { LandingLink } from '@waldur/marketplace/links/LandingLink';
import { EmptyResourcesListPlaceholder } from '@waldur/marketplace/resources/list/EmptyResourcesListPlaceholder';
import { ExpandableResourceSummary } from '@waldur/marketplace/resources/list/ExpandableResourceSummary';
import { ResourceActionsButton } from '@waldur/marketplace/resources/list/ResourceActionsButton';
import { ResourceNameField } from '@waldur/marketplace/resources/list/ResourceNameField';
import { ResourceStateField } from '@waldur/marketplace/resources/list/ResourceStateField';
import { resourcesListRequiredFields } from '@waldur/marketplace/resources/list/utils';
import { ResourceMultiSelectAction } from '@waldur/marketplace/resources/mass-actions/ResourceMultiSelectAction';
import { Resource } from '@waldur/marketplace/resources/types';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { USER_RESOURCES_FILTER_FORM_ID } from '../constants';

import { ProjectResourcesAllFilter } from './ResourcesFilter';

interface FieldProps {
  row: Resource;
}

const mapPropsToFilter = createSelector(
  getFormValues(USER_RESOURCES_FILTER_FORM_ID),
  (filters: any) => {
    const result: Record<string, any> = {};
    if (filters) {
      if (filters.offering) {
        result.offering_uuid = filters.offering.uuid;
      }
      if (filters.state) {
        result.state = filters.state.value;
      }
      if (filters.category) {
        result.category_uuid = filters.category.uuid;
      }
      if (filters.organization) {
        result.customer_uuid = filters.organization.uuid;
      }
      if (filters.project) {
        result.project_uuid = filters.project.uuid;
      }
      if (filters.runtime_state) {
        result.runtime_state = filters.runtime_state.value;
      }
      if (filters.state) {
        result.state = filters.state.map((option) => option.value);
      }
    }
    result.field = resourcesListRequiredFields();
    return result;
  },
);

const tableActions = (
  <LandingLink>
    <Button variant="primary">
      <i className="fa fa-plus" /> {translate('Add resource')}
    </Button>
  </LandingLink>
);

export const ResourcesList = () => {
  const filter = useSelector(mapPropsToFilter);
  const tableProps = useTable({
    table: `UserResourcesList`,
    fetchData: createFetcher('marketplace-resources'),
    queryField: 'query',
    filter,
  });

  return (
    <Table
      {...tableProps}
      filters={<ProjectResourcesAllFilter />}
      columns={[
        {
          title: translate('Name'),
          render: ResourceNameField,
          orderField: 'name',
        },
        {
          title: translate('Category'),
          render: ({ row }: FieldProps) => <>{row.category_title}</>,
        },
        {
          title: translate('Offering'),
          render: ({ row }: FieldProps) => <>{row.offering_name}</>,
        },
        {
          title: translate('Organization'),
          render: ({ row }) => <>{row.customer_name || 'N/A'}</>,
        },
        {
          title: translate('Project'),
          render: ({ row }) => <>{row.project_name || 'N/A'}</>,
        },
        {
          title: translate('Created at'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
          orderField: 'created',
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceStateField resource={row} />,
        },
      ]}
      verboseName={translate('Resources')}
      placeholderComponent={<EmptyResourcesListPlaceholder />}
      initialSorting={{ field: 'created', mode: 'desc' }}
      hoverableRow={({ row }) => (
        <ResourceActionsButton row={row} refetch={tableProps.fetch} />
      )}
      hasQuery={true}
      showPageSizeSelector={true}
      expandableRow={ExpandableResourceSummary}
      enableMultiSelect={true}
      multiSelectActions={ResourceMultiSelectAction}
      actions={tableActions}
    />
  );
};
