import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import {
  marketplaceResourcesList,
  MarketplaceResourcesListData,
} from 'waldur-js-client';

import { PROJECT_RESOURCES_ALL_FILTER_FORM_ID } from '@waldur/marketplace/resources/list/constants';
import { createFetcher } from '@waldur/table/api';
import { TableProps } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { getCustomer } from '@waldur/workspace/selectors';

import { NON_TERMINATED_STATES } from './constants';
import { ResourcesAllListTable } from './ResourcesAllListTable';
import { resourcesListRequiredFields } from './utils';

const mapStateToFilter = createSelector(
  getCustomer,
  getFormValues(PROJECT_RESOURCES_ALL_FILTER_FORM_ID),
  (customer, filters: any) => {
    const result: MarketplaceResourcesListData['query'] = {};
    if (customer) {
      result.customer_uuid = customer.uuid;
    }
    if (filters?.offering) {
      result.offering_uuid = filters.offering.uuid;
    }
    if (filters?.parent_offering) {
      result.parent_offering_uuid = filters.parent_offering.uuid;
    }
    if (filters?.state) {
      result.state = filters.state.value;
    }
    if (filters?.category) {
      result.category_uuid = filters.category.uuid;
    }
    if (filters?.project) {
      result.project_uuid = filters.project.uuid;
    }
    if (filters?.runtime_state) {
      result.runtime_state = filters.runtime_state.value;
    }
    if (filters?.state) {
      result.state = filters.state.map((option) => option.value);
      if (filters?.include_terminated) {
        result.state = [...result.state, 'Terminated'];
      }
    } else {
      if (!filters?.include_terminated) {
        result.state = NON_TERMINATED_STATES;
      }
    }
    if (filters?.paused) {
      result.paused = true;
    }
    if (filters?.downscaled) {
      result.downscaled = true;
    }
    if (filters?.restrict_member_access) {
      result.restrict_member_access = true;
    }
    return result;
  },
);

export const OrganizationResourcesAllList: FC<Partial<TableProps>> = (
  props,
) => {
  const filter = useSelector(mapStateToFilter);
  const tableProps = useTable({
    table: `OrganizationResourcesAllList`,
    fetchData: createFetcher(marketplaceResourcesList),
    queryField: 'query',
    filter,
    mandatoryFields: resourcesListRequiredFields(),
  });

  return (
    <ResourcesAllListTable
      {...tableProps}
      {...props}
      hasProjectColumn
      context="organization"
    />
  );
};
