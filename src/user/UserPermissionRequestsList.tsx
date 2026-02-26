import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { userPermissionRequestsList } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { PermissionRequestStateField } from '@waldur/invitations/PermissionRequestStateField';
import { createFetcher } from '@waldur/table/api';
import {
  UserPermissionRequestsFilter,
  selectUserPermissionRequestsFilter,
  UserPermissionRequestsRemoteProjectUpdateRequestStateOptions as RemoteProjectUpdateRequestStateOptions,
} from '@waldur/table/generated/UserPermissionRequestsFilter';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { USER_PERMISSION_REQUESTS_TABLE_ID } from '@waldur/user/constants';
import { getUser } from '@waldur/workspace/selectors';

import { UserPermissionRequestActions } from './UserPermissionRequestActions';
import { UserPermissionRequestExpandableRow } from './UserPermissionRequestExpandableRow';

export const UserPermissionRequestsList = () => {
  const user = useSelector(getUser);
  const formFilter = useSelector(selectUserPermissionRequestsFilter);
  const filter = useMemo(
    () => ({
      created_by: user?.uuid,
      ...formFilter,
    }),
    [user?.uuid, formFilter],
  );
  const props = useTable({
    table: USER_PERMISSION_REQUESTS_TABLE_ID,
    fetchData: createFetcher(userPermissionRequestsList),
    filter,
  });
  const columns = [
    {
      title: translate('Name'),
      render: ({ row }) => row.customer_name,
    },
    {
      title: translate('Date of request'),
      render: ({ row }) => formatDateTime(row.created),
    },
    {
      title: translate('Type'),
      render: ({ row }) =>
        row.role_name.startsWith('PROJECT')
          ? translate('Project')
          : row.role_name.startsWith('CUSTOMER')
            ? translate('Organization')
            : row.role_name,
    },
    {
      title: translate('Status'),
      render: PermissionRequestStateField,
      filter: 'state',
      inlineFilter: (row) =>
        RemoteProjectUpdateRequestStateOptions.filter(
          (s) => s.value === row.state,
        ),
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('user permission requests')}
      showPageSizeSelector={true}
      filters={<UserPermissionRequestsFilter />}
      rowActions={UserPermissionRequestActions}
      expandableRow={UserPermissionRequestExpandableRow}
    />
  );
};
