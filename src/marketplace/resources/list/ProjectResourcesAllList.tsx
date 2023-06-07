import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import {
  PROJECT_RESOURCES_ALL_FILTER_FORM_ID,
  RESOURCE_STATES,
} from '@waldur/marketplace/resources/list/constants';
import { ResourceMultiSelectAction } from '@waldur/marketplace/resources/mass-actions/ResourceMultiSelectAction';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import { getProject } from '@waldur/workspace/selectors';

import { Resource } from '../types';

import { EmptyResourcesListPlaceholder } from './EmptyResourcesListPlaceholder';
import { ExpandableResourceSummary } from './ExpandableResourceSummary';
import { ProjectResourcesAllFilter } from './ProjectResourcesAllFilter';
import { ResourceActionsButton } from './ResourceActionsButton';
import { ResourceNameField } from './ResourceNameField';
import { ResourceStateField } from './ResourceStateField';

interface FieldProps {
  row: Resource;
}

const mapPropsToFilter = createSelector(
  getProject,
  getFormValues(PROJECT_RESOURCES_ALL_FILTER_FORM_ID),
  (project, filters: any) => {
    const result: Record<string, any> = {
      state: RESOURCE_STATES,
    };
    if (project) {
      result.project_uuid = project.uuid;
    }
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
      if (filters.runtime_state) {
        result.runtime_state = filters.runtime_state.value;
      }
      if (filters.state) {
        result.state = filters.state.value;
      }
    }
    return result;
  },
);

export const ProjectResourcesAllList = () => {
  const filter = useSelector(mapPropsToFilter);
  const project = useSelector(getProject);
  const tableProps = useTable({
    table: `ProjectResourcesAllList-${project.uuid}`,
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
          title: translate('Created at'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
          orderField: 'created',
        },
        {
          title: translate('State'),
          render: ResourceStateField,
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
    />
  );
};
