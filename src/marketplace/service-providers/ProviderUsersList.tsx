import { useCallback } from 'react';
import { marketplaceServiceProvidersUsersList } from 'waldur-js-client';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { CustomerResourcesListPlaceholder } from '../resources/list/CustomerResourcesListPlaceholder';

import { CustomerContactColumn } from './CustomerContactColumn';
import { ProjectsCountColumn } from './ProjectsCountColumn';
import { ProviderUserCustomersList } from './ProviderUserCustomersList';
import { ProviderUsersRowActions } from './ProviderUsersRowActions';
import { PROVIDER_CUSTOMERS_TABLE_TABS } from './utils';

const UserNameColumn = ({ row }) => (
  <>
    <Link
      state="marketplace-provider-user-manage"
      params={{ user_uuid: row.uuid }}
      label={renderFieldOrDash(row.full_name)}
      className="fw-bold"
    />

    {row.organization ? (
      <p className="text-muted mb-0">{row.organization}</p>
    ) : null}
  </>
);

const ProviderUsersListComponent = ({ provider }) => {
  const tableProps = useTable({
    table: 'marketplace-provider-users',
    fetchData: createFetcher(marketplaceServiceProvidersUsersList, {
      path: { service_provider_uuid: provider.uuid },
    }),
    queryField: 'query',
  });
  const ExpandableRow = useCallback(
    ({ row }) => <ProviderUserCustomersList user={row} provider={provider} />,
    [provider],
  );
  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('User'),
          render: UserNameColumn,
          ellipsis: true,
        },
        {
          title: translate('Contact'),
          render: CustomerContactColumn,
          ellipsis: true,
        },
        {
          title: translate('Affiliations'),
          render: ProjectsCountColumn,
          ellipsis: true,
        },
      ]}
      rowActions={ProviderUsersRowActions}
      showPageSizeSelector={true}
      tabs={PROVIDER_CUSTOMERS_TABLE_TABS}
      verboseName={translate('users')}
      expandableRow={ExpandableRow}
      hasQuery={true}
    />
  );
};

export const ProviderUsersList = ({ provider }) => {
  if (!provider) {
    return <CustomerResourcesListPlaceholder />;
  }
  return <ProviderUsersListComponent provider={provider} />;
};
