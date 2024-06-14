import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { PROJECT_RESOURCES_ALL_FILTER_FORM_ID } from '@waldur/marketplace/resources/list/constants';
import { createFetcher } from '@waldur/table';
import { TableProps } from '@waldur/table/Table';
import { useTable } from '@waldur/table/utils';
import { Project } from '@waldur/workspace/types';

import { ResourcesAllListTable } from './ResourcesAllListTable';
import { resourcesListRequiredFields } from './utils';

const mapStateToFilter = createSelector(
  getFormValues(PROJECT_RESOURCES_ALL_FILTER_FORM_ID),
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
      if (filters.project) {
        result.project_uuid = filters.project.uuid;
      }
      if (filters.runtime_state) {
        result.runtime_state = filters.runtime_state.value;
      }
      if (filters.state) {
        result.state = filters.state.map((option) => option.value);
      }
      if (filters.organization) {
        result.customer_uuid = filters.organization.uuid;
      }
    }
    result.field = resourcesListRequiredFields();
    return result;
  },
);

interface UserResourcesAllListProps extends Partial<TableProps> {
  project?: Project;
}

export const UserResourcesAllList: FC<UserResourcesAllListProps> = (props) => {
  const filter = useSelector(mapStateToFilter);
  const tableProps = useTable({
    table: `UserResourcesAllList`,
    fetchData: createFetcher('marketplace-resources'),
    queryField: 'query',
    filter,
  });

  return (
    <ResourcesAllListTable
      {...tableProps}
      {...props}
      hasProjectColumn
      hasCustomerColumn
      standalone={props.standalone ?? true}
    />
  );
};
