import { useCallback } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

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
    fetchData: createFetcher(
      `marketplace-service-providers/${provider.uuid}/users`,
    ),
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
