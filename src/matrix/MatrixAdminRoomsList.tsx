import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { MatrixRoom, matrixRoomsList } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { OrganizationLink } from '@/customer/list/OrganizationLink';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ProjectLink } from '@/project/ProjectLink';
import { ActionButton } from '@/table/ActionButton';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import {
  isStaff as isStaffSelector,
  isStaffOrSupport as isStaffOrSupportSelector,
} from '@/workspace/selectors';

import { AdminCreateMatrixRoomDialog } from './AdminCreateMatrixRoomDialog';
import {
  DisableChatButton,
  ExportHistoryButton,
  JoinLeaveRoomButton,
  OpenInMatrixButton,
  OpenInTeamChatButton,
  ReactivateChatButton,
  RetryRoomButton,
  SyncMembersButton,
} from './MatrixRoomActions';
import { MatrixRoomExpandableRow } from './MatrixRoomExpandableRow';
import { MatrixRoomStateBadge } from './MatrixRoomStateBadge';

const STAFF_ACTIONS = [
  OpenInTeamChatButton,
  OpenInMatrixButton,
  JoinLeaveRoomButton,
  SyncMembersButton,
  ExportHistoryButton,
  RetryRoomButton,
  ReactivateChatButton,
  DisableChatButton,
];

// Support is a read/observer role that may also join rooms to help; the
// admin/destructive actions stay staff-only (and are 403-gated server-side).
const SUPPORT_ACTIONS = [
  OpenInTeamChatButton,
  OpenInMatrixButton,
  JoinLeaveRoomButton,
];

const RowActions: FC<{ row: MatrixRoom; fetch(): void }> = ({ row, fetch }) => {
  const staff = useSelector(isStaffSelector);
  const staffOrSupport = useSelector(isStaffOrSupportSelector);
  if (!staffOrSupport) return null;
  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      actions={staff ? STAFF_ACTIONS : SUPPORT_ACTIONS}
    />
  );
};

const CreateRoomAction: FC<{ refetch(): void }> = ({ refetch }) => {
  const { openDialog } = useModal();
  const handleClick = useCallback(
    () =>
      openDialog(AdminCreateMatrixRoomDialog, {
        resolve: { refetch },
      }),
    [openDialog, refetch],
  );
  return (
    <ActionButton
      title={translate('Create')}
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
      action={handleClick}
    />
  );
};

export const MatrixAdminRoomsList: FC = () => {
  const filter = useMemo(() => ({}), []);

  const tableProps = useTable({
    table: 'matrix-admin-rooms',
    fetchData: createFetcher(matrixRoomsList),
    filter,
    queryField: 'room_name',
  });

  const columns: Column<MatrixRoom>[] = [
    {
      title: translate('Organization'),
      render: ({ row }) =>
        row.customer_uuid && row.customer_name ? (
          <OrganizationLink uuid={row.customer_uuid}>
            {row.customer_name}
          </OrganizationLink>
        ) : (
          renderFieldOrDash(null)
        ),
      id: 'customer_name',
    },
    {
      title: translate('Project'),
      render: ({ row }) =>
        row.scope_uuid && row.scope_name ? (
          <ProjectLink
            row={{ uuid: row.scope_uuid, name: row.scope_name } as any}
          />
        ) : (
          renderFieldOrDash(null)
        ),
      id: 'scope_name',
    },
    {
      title: translate('State'),
      render: ({ row }) => (
        <MatrixRoomStateBadge
          state={row.state}
          errorMessage={row.error_message}
        />
      ),
      id: 'state',
    },
    {
      title: translate('Members'),
      render: ({ row }) => <>{row.members_count}</>,
      id: 'members_count',
    },
    {
      title: translate('Room alias'),
      render: ({ row }) => renderFieldOrDash(row.room_alias),
      id: 'room_alias',
      optional: true,
    },
    {
      title: translate('Created'),
      render: ({ row }) => <>{formatDateTime(row.created)}</>,
      id: 'created',
      orderField: 'created',
    },
  ];

  return (
    <Table<MatrixRoom>
      {...tableProps}
      columns={columns}
      hasQuery
      hasOptionalColumns
      verboseName={translate('Matrix rooms')}
      rowActions={RowActions}
      tableActions={<CreateRoomAction refetch={tableProps.fetch} />}
      expandableRow={MatrixRoomExpandableRow}
    />
  );
};
