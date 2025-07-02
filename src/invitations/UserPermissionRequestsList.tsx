import { FC, useMemo } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { USER_PERMISSION_REQUESTS_TABLE_ID } from '@waldur/invitations/constants';
import { PermissionRequestStateField } from '@waldur/invitations/PermissionRequestStateField';
import { UserPermissionRequestRowActions } from '@waldur/invitations/UserPermissionRequestRowActions';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

interface OwnProps {
  groupInvitationUuid: string;
}

export const UserPermissionRequestsList: FC<OwnProps> = ({
  groupInvitationUuid,
}) => {
  const tableOptions = useMemo(
    () => ({
      table: [USER_PERMISSION_REQUESTS_TABLE_ID, groupInvitationUuid].join('-'),
      fetchData: createFetcher('user-permission-requests'),
      filter: {
        invitation: groupInvitationUuid,
      },
    }),
    [groupInvitationUuid],
  );
  const props = useTable(tableOptions);
  const columns = [
    {
      title: translate('Created by'),
      render: ({ row }) => row.created_by_full_name,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
    },
    {
      title: translate('Reviewed at'),
      render: ({ row }) =>
        row.reviewed_at ? formatDateTime(row.reviewed_at) : 'N/A',
    },
    {
      title: translate('Comment'),
      render: ({ row }) => row.review_comment,
    },
    {
      title: translate('State'),
      render: PermissionRequestStateField,
      className: 'w-175px',
    },
    {
      title: translate('Actions'),
      render: ({ row }) => (
        <UserPermissionRequestRowActions row={row} refetch={props.fetch} />
      ),

      className: 'w-90px',
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      title={translate('User permission requests')}
      verboseName={translate('user permission requests')}
      showPageSizeSelector
      initialPageSize={5}
      minHeight="auto"
      placeholderHasRetry={false}
      hoverShadow={false}
      hideRefresh
      headerClassName="py-0 min-h-45px"
      titleClassName="fs-6 fw-bolder text-gray-700"
    />
  );
};
