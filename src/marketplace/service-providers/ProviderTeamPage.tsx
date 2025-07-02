import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { renderRoleExpirationDate } from '@waldur/customer/team/CustomerUsersList';
import { translate } from '@waldur/i18n';
import { GenericPermission } from '@waldur/permissions/types';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { getCustomer } from '@waldur/workspace/selectors';

import { UserAddButton } from './UserAddButton';

export const ProviderTeamPage = () => {
  const customer = useSelector(getCustomer);
  const usersFilter = useMemo(
    () => ({
      scope: customer.service_provider,
    }),
    [customer.service_provider],
  );
  const url =
    'marketplace-service-providers/' +
    customer.service_provider_uuid +
    '/list_users';
  const tableProps = useTable({
    table: `ProviderTeamPage/${customer.service_provider_uuid}`,
    fetchData: createFetcher(url),
    filter: usersFilter,
    queryField: 'search_string',
  });
  const columns = [
    {
      title: translate('User'),
      render: ({ row }) => <>{row.user_full_name || row.user_username}</>,
      copyField: (row) => row.user_full_name || row.user_username,
    },
    {
      title: translate('Email'),
      render: ({ row }) => <>{row.user_email}</>,
      copyField: (row) => row.user_email,
    },
    {
      title: translate('Role expiration'),
      render: ({ row }) => renderRoleExpirationDate(row),
    },
  ];

  return (
    <Table<GenericPermission>
      {...tableProps}
      columns={columns}
      title={translate('Team members')}
      verboseName={translate('Team members')}
      hasQuery={true}
      tableActions={<UserAddButton refetch={tableProps.fetch} />}
    />
  );
};
