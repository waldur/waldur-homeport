import { useCallback, useMemo } from 'react';
import { marketplaceServiceProvidersProjectsList } from 'waldur-js-client';

import { ProjectsListTable } from '@/project/ProjectsList';
import { createFetcher } from '@/table/api';
import {
  MarketplaceServiceProvidersProjectsFilter,
  MarketplaceServiceProvidersProjectsFilterFormId,
  selectMarketplaceServiceProvidersProjectsFilter,
} from '@/table/generated/MarketplaceServiceProvidersProjectsFilter';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';

import { CustomerResourcesListPlaceholder } from '../resources/list/CustomerResourcesListPlaceholder';

import { ProviderProjectExpandableRow } from './ProviderProjectExpandableRow';
import { PROVIDER_CUSTOMERS_TABLE_TABS } from './utils';

const TABLE_ID = 'marketplace-provider-projects';

const ProviderProjectsListComponent = ({ provider }) => {
  const filterValues = useFilterValues(TABLE_ID);
  const filter = useMemo(
    () => selectMarketplaceServiceProvidersProjectsFilter(filterValues),
    [filterValues],
  );
  const tableProps = useTable({
    table: TABLE_ID,
    fetchData: createFetcher(marketplaceServiceProvidersProjectsList, {
      path: { service_provider_uuid: provider.uuid },
    }),
    queryField: 'query',
    filter,
    mandatoryFields: ['project_metadata'], // This is required to display the metadata tab in the expandable row
  });

  const ExpandableRow = useCallback(
    ({ row }) => (
      <ProviderProjectExpandableRow row={row} providerUuid={provider.uuid} />
    ),
    [provider.uuid],
  );

  return (
    <ProjectsListTable
      {...tableProps}
      tabs={PROVIDER_CUSTOMERS_TABLE_TABS}
      tableActions={null}
      rowActions={null}
      expandableRow={ExpandableRow}
      filters={<MarketplaceServiceProvidersProjectsFilter />}
      formId={MarketplaceServiceProvidersProjectsFilterFormId}
    />
  );
};

export const ProviderProjectsList = ({ provider }) => {
  if (!provider) {
    return <CustomerResourcesListPlaceholder />;
  }
  return <ProviderProjectsListComponent provider={provider} />;
};
