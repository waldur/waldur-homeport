import { FC, useMemo } from 'react';
import { marketplaceResourcesList, Project } from 'waldur-js-client';

import { translate } from '@/i18n';
import {
  ALL_RESOURCES_TABLE_ID,
  PROJECT_RESOURCES_ALL_FILTER_FORM_ID,
} from '@/marketplace/resources/list/constants';
import { useOrganizationAndProjectAutocompletesForResources } from '@/navigation/sidebar/resources-filter/utils';
import { useTitle } from '@/navigation/title';
import { createFetcher } from '@/table/api';
import { TableProps } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';

import { ResourcesAllListTable } from './ResourcesAllListTable';
import { buildResourcesAllFilter, resourcesListRequiredFields } from './utils';

interface AllResourcesListProps extends Partial<TableProps> {
  project?: Project;
}

export const AllResourcesList: FC<AllResourcesListProps> = ({ ...props }) => {
  useTitle(translate('All resources'), '', 'browser');
  const { syncResourceFilters } =
    useOrganizationAndProjectAutocompletesForResources('all-resources');

  const values = useFilterValues(ALL_RESOURCES_TABLE_ID);
  const filterValues: any = values;

  const filter = useMemo(
    () => buildResourcesAllFilter(filterValues),
    [filterValues],
  );

  const tableProps = useTable({
    table: ALL_RESOURCES_TABLE_ID,
    syncFiltersToURL: true,
    fetchData: createFetcher(marketplaceResourcesList),
    queryField: 'query',
    filter,
    onApplyFilter: (filters) => {
      const organization = filters.find((item) => item.name === 'organization');
      const project = filters.find((item) => item.name === 'project');
      const formValues = {
        organization: organization?.value,
        project: project?.value,
      };
      syncResourceFilters(formValues);
    },
    mandatoryFields: resourcesListRequiredFields(),
  });

  return (
    <ResourcesAllListTable
      {...tableProps}
      {...props}
      formId={PROJECT_RESOURCES_ALL_FILTER_FORM_ID}
      hasProjectColumn
      hasCustomerColumn
      standalone={props.standalone ?? true}
    />
  );
};
