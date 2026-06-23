import { useCallback } from 'react';
import { marketplaceServiceProvidersProjectsList } from 'waldur-js-client';

import { ProjectsListTable } from '@/project/ProjectsList';
import { createFetcher } from '@/table/api';
import { useTable } from '@/table/useTable';

import { CustomerResourcesListPlaceholder } from '../resources/list/CustomerResourcesListPlaceholder';

import { ProviderProjectExpandableRow } from './ProviderProjectExpandableRow';
import { PROVIDER_CUSTOMERS_TABLE_TABS } from './utils';

const ProviderProjectsListComponent = ({ provider }) => {
  const tableProps = useTable({
    table: 'marketplace-provider-projects',
    fetchData: createFetcher(marketplaceServiceProvidersProjectsList, {
      path: { service_provider_uuid: provider.uuid },
    }),
    queryField: 'query',
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
    />
  );
};

export const ProviderProjectsList = ({ provider }) => {
  if (!provider) {
    return <CustomerResourcesListPlaceholder />;
  }
  return <ProviderProjectsListComponent provider={provider} />;
};
