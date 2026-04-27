import { FC, useMemo } from 'react';
import { userPermissionRequestsList } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { USER_PERMISSION_REQUESTS_TABLE_ID } from '@/invitations/constants';
import { PermissionRequestStateField } from '@/invitations/PermissionRequestStateField';
import { UserPermissionRequestRowActions } from '@/invitations/UserPermissionRequestRowActions';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

interface OwnProps {
  groupInvitationUuid: string;
}

export const UserPermissionRequestsList: FC<OwnProps> = ({
  groupInvitationUuid,
}) => {
  const tableOptions = useMemo(
    () => ({
      table: [USER_PERMISSION_REQUESTS_TABLE_ID, groupInvitationUuid].join('-'),
      fetchData: createFetcher(userPermissionRequestsList),
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
      title: translate('Requested project'),
      render: ({ row }) => row.project_name || null,
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
      rowActions={UserPermissionRequestRowActions}
    />
  );
};
