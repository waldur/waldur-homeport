import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { ENV } from '@waldur/core/config';
import { renderRoleExpirationDate } from '@waldur/customer/team/CustomerUsersList';
import { translate } from '@waldur/i18n';
import { GenericPermission } from '@waldur/permissions/types';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { getCustomer } from '@waldur/workspace/selectors';

import { UserAddButton } from './UserAddButton';

export const CallManagementTeamPage = () => {
  const customer = useSelector(getCustomer);
  const scopeFilter = `${ENV.apiEndpoint}api/call-managing-organisations/${customer.call_managing_organization_uuid}/`;
  const fetchUrl = `call-managing-organisations/${customer.call_managing_organization_uuid}/list_users`;
  const usersFilter = useMemo(
    () => ({
      scope: scopeFilter,
    }),
    [scopeFilter],
  );
  const tableProps = useTable({
    table: `CallManagementTeamPage/${customer.call_managing_organization_uuid}`,
    fetchData: createFetcher(fetchUrl),
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
