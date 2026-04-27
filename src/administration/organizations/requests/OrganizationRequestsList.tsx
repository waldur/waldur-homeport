import { FC } from 'react';
import { userPermissionRequestsList } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { PermissionRequestStateField } from '@/invitations/PermissionRequestStateField';
import { UserPermissionRequestRowActions } from '@/invitations/UserPermissionRequestRowActions';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { RoleField } from '@/user/affiliations/RoleField';

export const OrganizationRequestsList: FC = () => {
  const props = useTable({
    table: 'UserPermissionRequests',
    fetchData: createFetcher(userPermissionRequestsList),
  });

  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('User name'),
          render: ({ row }) => row.created_by_full_name,
        },
        {
          title: translate('Email'),
          render: ({ row }) => row.created_by_email,
        },
        {
          title: translate('Role'),
          render: RoleField,
        },
        {
          title: translate('Organization'),
          render: ({ row }) => row.customer_name,
        },
        {
          title: translate('Date of request'),
          render: ({ row }) => formatDateTime(row.created),
        },
        {
          title: translate('Status'),
          render: PermissionRequestStateField,
        },
      ]}
      title={translate('Requests')}
      verboseName={translate('Requests')}
      rowActions={UserPermissionRequestRowActions}
    />
  );
};
