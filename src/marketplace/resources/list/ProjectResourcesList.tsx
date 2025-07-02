import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import { MarketplaceResourcesListData, Project } from 'waldur-js-client';

import { PROJECT_RESOURCES_ALL_FILTER_FORM_ID } from '@waldur/marketplace/resources/list/constants';
import { createFetcher } from '@waldur/table/api';
import { TableProps } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { NON_TERMINATED_STATES } from './constants';
import { ResourcesAllListTable } from './ResourcesAllListTable';
import { resourcesListRequiredFields } from './utils';

const mapStateToFilter = createSelector(
  getFormValues(PROJECT_RESOURCES_ALL_FILTER_FORM_ID),
  (filters: any) => {
    const result: MarketplaceResourcesListData['query'] = {};
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
    if (filters?.runtime_state) {
      result.runtime_state = filters.runtime_state.value;
    }
    if (filters?.state) {
      result.state = filters.state.map(
        (option) => option.value,
      ) as MarketplaceResourcesListData['query']['state'];
      if (filters?.include_terminated) {
        result.state = [...result.state, 'Terminated'];
      }
    } else {
      if (!filters?.include_terminated) {
        result.state = NON_TERMINATED_STATES;
      }
    }
    return result;
  },
);

interface ProjectResourcesListProps extends Partial<TableProps> {
  project: Project;
}

export const ProjectResourcesList: FC<ProjectResourcesListProps> = (props) => {
  const stateFilter = useSelector(mapStateToFilter);
  const filter = useMemo(
    () => ({ project_uuid: props.project.uuid, ...stateFilter }),
    [props.project, stateFilter],
  );
  const tableProps = useTable({
    table: `ProjectResourcesList`,
    fetchData: createFetcher('marketplace-resources'),
    queryField: 'query',
    filter,
    mandatoryFields: resourcesListRequiredFields(),
  });

  return <ResourcesAllListTable {...tableProps} {...props} context="project" />;
};
