import { FC, useMemo } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { USER_PERMISSION_REQUESTS_TABLE_ID } from '@waldur/invitations/constants';
import { PermissionRequestStateField } from '@waldur/invitations/PermissionRequestStateField';
import { UserPermissionRequestRowActions } from '@waldur/invitations/UserPermissionRequestRowActions';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

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
    },
    {
      title: translate('Actions'),
      render: ({ row }) => (
        <UserPermissionRequestRowActions row={row} refetch={props.fetch} />
      ),
    },
  ];
  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('user permission requests')}
      showPageSizeSelector={true}
    />
  );
};
