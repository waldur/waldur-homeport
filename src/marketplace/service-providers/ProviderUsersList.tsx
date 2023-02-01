import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { Table, connectTable } from '@waldur/table/index';
import { UserDetailsButton } from '@waldur/user/support/UserDetailsButton';

import { CustomerResourcesListPlaceholder } from '../resources/list/CustomerResourcesListPlaceholder';

import { fetchProviderUsers } from './api';
import { CustomerContactColumn } from './CustomerContactColumn';

const UserNameColumn = ({ row }) => (
  <>
    <b>{row.full_name}</b>
    {row.organization ? <p className="text-muted">{row.organization}</p> : null}
  </>
);

const UserAffiliations = ({ row }) =>
  translate('{projects_count} projects', row);

const TableComponent: FunctionComponent<any> = (props) => {
  return (
    <Table
      {...props}
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
          render: UserAffiliations,
        },
      ]}
      hoverableRow={UserDetailsButton}
      showPageSizeSelector={true}
      verboseName={translate('users')}
      enableExport={true}
    />
  );
};

const TableOptions = {
  table: 'marketplace-provider-users',
  fetchData: fetchProviderUsers,
  mapPropsToFilter: ({ provider }) => ({ provider_uuid: provider.uuid }),
};

const ProviderUsersListComponent = connectTable(TableOptions)(
  TableComponent,
) as React.ComponentType<any>;

export const ProviderUsersList = ({ provider }) => {
  if (!provider) {
    return <CustomerResourcesListPlaceholder />;
  }
  return <ProviderUsersListComponent provider={provider} />;
};
