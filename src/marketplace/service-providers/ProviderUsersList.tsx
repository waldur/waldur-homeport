import { useCallback } from 'react';

import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table/index';
import { useTable } from '@waldur/table/utils';
import { UserDetailsButton } from '@waldur/user/support/UserDetailsButton';

import { CustomerResourcesListPlaceholder } from '../resources/list/CustomerResourcesListPlaceholder';

import { CustomerContactColumn } from './CustomerContactColumn';
import { ProjectsCountColumn } from './ProjectsCountColumn';
import { ProviderUserCustomersList } from './ProviderUserCustomersList';

const UserNameColumn = ({ row }) => (
  <>
    <b>{row.full_name}</b>
    {row.organization ? <p className="text-muted">{row.organization}</p> : null}
  </>
);

const ProviderUsersListComponent = ({ provider }) => {
  const tableProps = useTable({
    table: 'marketplace-provider-users',
    fetchData: createFetcher(
      `marketplace-service-providers/${provider.uuid}/users`,
    ),
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
        },
        {
          title: translate('Contact'),
          render: CustomerContactColumn,
        },
        {
          title: translate('Affiliations'),
          render: ProjectsCountColumn,
        },
      ]}
      hoverableRow={UserDetailsButton}
      showPageSizeSelector={true}
      verboseName={translate('users')}
      expandableRow={ExpandableRow}
    />
  );
};

export const ProviderUsersList = ({ provider }) => {
  if (!provider) {
    return <CustomerResourcesListPlaceholder />;
  }
  return <ProviderUsersListComponent provider={provider} />;
};
