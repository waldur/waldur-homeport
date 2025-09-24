import { FC } from 'react';
import { userPermissionRequestsList } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { PermissionRequestStateField } from '@waldur/invitations/PermissionRequestStateField';
import { UserPermissionRequestRowActions } from '@waldur/invitations/UserPermissionRequestRowActions';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { RoleField } from '@waldur/user/affiliations/RoleField';

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
