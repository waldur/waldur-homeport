import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { PROJECT_RESOURCES_ALL_FILTER_FORM_ID } from '@waldur/marketplace/resources/list/constants';
import { createFetcher } from '@waldur/table';
import { TableProps } from '@waldur/table/Table';
import { useTable } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { ResourcesAllListTable } from './ResourcesAllListTable';
import { resourcesListRequiredFields } from './utils';

const mapPropsToFilter = createSelector(
  getCustomer,
  getFormValues(PROJECT_RESOURCES_ALL_FILTER_FORM_ID),
  (customer, filters: any) => {
    const result: Record<string, any> = {};
    if (customer) {
      result.customer_uuid = customer.uuid;
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

export const OrganizationResourcesAllList: FC<Partial<TableProps>> = (
  props,
) => {
  const filter = useSelector(mapPropsToFilter);
  const tableProps = useTable({
    table: `OrganizationResourcesAllList`,
    fetchData: createFetcher('marketplace-resources'),
    queryField: 'query',
    filter,
  });

  return <ResourcesAllListTable {...tableProps} {...props} hasProjectColumn />;
};
