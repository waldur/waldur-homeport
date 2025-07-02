import { ProjectsListTable } from '@waldur/project/ProjectsList';
import { createFetcher } from '@waldur/table/api';
import { useTable } from '@waldur/table/useTable';

import { CustomerResourcesListPlaceholder } from '../resources/list/CustomerResourcesListPlaceholder';

import { PROVIDER_CUSTOMERS_TABLE_TABS } from './utils';

const ProviderProjectsListComponent = ({ provider }) => {
  const tableProps = useTable({
    table: 'marketplace-provider-projects',
    fetchData: createFetcher(
      `marketplace-service-providers/${provider.uuid}/projects`,
    ),
    queryField: 'query',
  });

  return (
    <ProjectsListTable
      {...tableProps}
      tabs={PROVIDER_CUSTOMERS_TABLE_TABS}
      tableActions={null}
      rowActions={null}
    />
  );
};

export const ProviderProjectsList = ({ provider }) => {
  if (!provider) {
    return <CustomerResourcesListPlaceholder />;
  }
  return <ProviderProjectsListComponent provider={provider} />;
};
