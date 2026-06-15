import { FC, useMemo } from 'react';
import { marketplaceResourcesList, Project } from 'waldur-js-client';

import { PROJECT_RESOURCES_ALL_FILTER_FORM_ID } from '@/marketplace/resources/list/constants';
import { createFetcher } from '@/table/api';
import { TableProps } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';

import { ResourcesAllListTable } from './ResourcesAllListTable';
import { buildResourcesAllFilter, resourcesListRequiredFields } from './utils';

interface ProjectResourcesListProps extends Partial<TableProps> {
  project: Project;
}

export const ProjectResourcesList: FC<ProjectResourcesListProps> = ({
  ...props
}) => {
  const values = useFilterValues(`ProjectResourcesList`);
  const filterValues: any = values;

  const filter = useMemo(
    () =>
      buildResourcesAllFilter(filterValues, {
        project_uuid: props.project.uuid,
      }),
    [filterValues, props.project],
  );

  const tableProps = useTable({
    table: `ProjectResourcesList`,
    syncFiltersToURL: true,
    fetchData: createFetcher(marketplaceResourcesList),
    queryField: 'query',
    filter,
    mandatoryFields: resourcesListRequiredFields(),
  });

  return (
    <ResourcesAllListTable
      {...tableProps}
      {...props}
      formId={PROJECT_RESOURCES_ALL_FILTER_FORM_ID}
      context="project"
    />
  );
};
