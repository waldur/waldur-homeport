import { ArrowsClockwiseIcon, EnvelopeIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import {
  User,
  userActionsList,
  UserAction,
  usersUpdateActions,
  usersSendNotification,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/notify';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

interface UserActionsDialogProps {
  resolve: {
    user: User;
  };
}

const TableActions: FC<{ userUuid: string; refetch: () => void }> = ({
  userUuid,
  refetch,
}) => {
  const { showErrorResponse, showSuccess } = useNotify();

  const onRecalculate = async () => {
    try {
      await usersUpdateActions({ path: { uuid: userUuid } });
      showSuccess(translate('User actions recalculation has been scheduled.'));
      refetch();
    } catch (e) {
      showErrorResponse(e, translate('Unable to recalculate user actions.'));
    }
  };

  const onSendNotification = async () => {
    try {
      await usersSendNotification({ path: { uuid: userUuid } });
      showSuccess(translate('Notification has been scheduled.'));
    } catch (e) {
      showErrorResponse(e, translate('Unable to send notification.'));
    }
  };

  return (
    <>
      <ActionItem
        title={translate('Send notification')}
        action={onSendNotification}
        iconNode={<EnvelopeIcon weight="bold" />}
      />
      <ActionItem
        title={translate('Recalculate')}
        action={onRecalculate}
        iconNode={<ArrowsClockwiseIcon weight="bold" />}
      />
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
