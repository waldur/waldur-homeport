import { useCallback } from 'react';
import { marketplaceServiceProvidersProjectsList } from 'waldur-js-client';

import { ProjectsListTable } from '@waldur/project/ProjectsList';
import { createFetcher } from '@waldur/table/api';
import { useTable } from '@waldur/table/useTable';

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
