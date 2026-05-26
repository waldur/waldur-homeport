import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { User, userActionsList, UserAction } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

import { RecalculateUserActionsAction } from './RecalculateUserActionsAction';
import { SendNotificationAction } from './SendNotificationAction';

interface UserActionsDialogProps {
  resolve: {
    user: User;
  };
}

const TableActions: FC<{ userUuid: string; refetch: () => void }> = ({
  userUuid,
  refetch,
}) => {
  return (
    <>
      <SendNotificationAction userUuid={userUuid} />
      <RecalculateUserActionsAction userUuid={userUuid} refetch={refetch} />
    </>
  );
};

const columns: Column<UserAction>[] = [
  {
    title: translate('Title'),
    render: ({ row }) => <>{row.title || DASH_ESCAPE_CODE}</>,
    id: 'title',
  },
  {
    title: translate('Type'),
    render: ({ row }) => <>{row.action_type || DASH_ESCAPE_CODE}</>,
    id: 'action_type',
  },
  {
    title: translate('Urgency'),
    render: ({ row }) => <>{row.urgency || DASH_ESCAPE_CODE}</>,
    id: 'urgency',
  },
  {
    title: translate('Due date'),
    render: ({ row }) =>
      row.due_date ? (
        <>{new Date(row.due_date).toLocaleDateString()}</>
      ) : (
        <>{DASH_ESCAPE_CODE}</>
      ),
    id: 'due_date',
  },
  {
    title: translate('Silenced'),
    render: ({ row }) => (
      <>{row.is_effectively_silenced ? translate('Yes') : translate('No')}</>
    ),
    id: 'silenced',
  },
];

export const UserActionsDialog: FC<UserActionsDialogProps> = ({
  resolve: { user },
}) => {
  const filter = useMemo(
    () => ({ user_uuid: user.uuid, include_silenced: true }),
    [user.uuid],
  );

  const tableProps = useTable({
    table: `UserActionsDebug-${user.uuid}`,
    fetchData: createFetcher(userActionsList),
    filter,
  });

  return (
    <ModalDialog
      title={translate('User actions for {fullName}', {
        fullName: user.full_name,
      })}
      subtitle={translate(
        'View and recalculate pending actions for this user.',
      )}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      iconColor="info"
    >
      <Table
        {...tableProps}
        columns={columns}
        verboseName={translate('user actions')}
        tableActions={
          <TableActions userUuid={user.uuid} refetch={tableProps.fetch} />
        }
      />
    </ModalDialog>
  );
};
