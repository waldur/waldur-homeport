import { FC, useMemo } from 'react';
import { marketplaceResourcesList } from 'waldur-js-client';

import { PROJECT_RESOURCES_ALL_FILTER_FORM_ID } from '@/marketplace/resources/list/constants';
import { createFetcher } from '@/table/api';
import { TableProps } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { useCustomer } from '@/workspace/hooks';

import { ResourcesAllListTable } from './ResourcesAllListTable';
import { buildResourcesAllFilter, resourcesListRequiredFields } from './utils';

export const OrganizationResourcesAllList: FC<Partial<TableProps>> = ({
  ...props
}) => {
  const customer = useCustomer();
  const values = useFilterValues(`OrganizationResourcesAllList`);
  const filterValues: any = values;

  const filter = useMemo(
    () =>
      buildResourcesAllFilter(filterValues, {
        customer_uuid: customer?.uuid,
      }),
    [filterValues, customer],
  );

  const tableProps = useTable({
    table: `OrganizationResourcesAllList`,
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
      hasProjectColumn
      context="organization"
    />
  );
};
