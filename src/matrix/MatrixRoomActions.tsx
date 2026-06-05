import {
  ArrowsClockwiseIcon,
  ArrowCounterClockwiseIcon,
  ChatsCircleIcon,
  ExportIcon,
  PowerIcon,
  SignInIcon,
  SignOutIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { FC, useCallback, useMemo } from 'react';
import {
  MatrixRoom,
  matrixRoomsDestroy,
  matrixRoomsExportHistory,
  matrixRoomsJoin,
  matrixRoomsLeave,
  matrixRoomsReactivate,
  matrixRoomsRetry,
  matrixRoomsSyncMembers,
} from 'waldur-js-client';

import { openUnifiedChatDrawer } from '@/chat/openUnifiedChatDrawer';
import { useDrawer } from '@/drawer/actions';
import { translate } from '@/i18n';
import { DisableChatRoomDialog } from '@/matrix/DisableChatRoomDialog';
import { MatrixCredentialsDialog } from '@/matrix/MatrixJoinButton';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

interface MatrixRoomActionsProps {
  row: MatrixRoom;
  refetch?(): void;
}

// You can only open a room's conversation if you actually belong to it — the
// backend withholds the room access token for non-members, so the chat would
// not load. Staff/support must Join first.
const isRoomMember = (row: MatrixRoom) =>
  row.current_user_membership_state === 'joined' ||
  row.current_user_membership_state === 'invited';

export const OpenInMatrixButton: FC<MatrixRoomActionsProps> = ({ row }) => {
  const { openDialog } = useModal();

  const handleJoin = useCallback(() => {
    openDialog(MatrixCredentialsDialog, {
      resolve: { roomAlias: row.room_alias, roomUuid: row.uuid },
    });
  }, [openDialog, row.room_alias, row.uuid]);

  const member = isRoomMember(row);

  return (
    <ActionItem
      title={translate('Open in Matrix')}
      action={handleJoin}
      iconNode={<ChatsCircleIcon weight="bold" />}
      disabled={row.state !== 'active' || !member}
      tooltip={
        row.state !== 'active'
          ? translate('Room must be active to join.')
          : !member
            ? translate('Join the room first to open it in Matrix.')
            : undefined
      }
    />
  );
};

export const JoinLeaveRoomButton: FC<MatrixRoomActionsProps> = ({
  row,
  refetch,
}) => {
  const isMember = isRoomMember(row);

  const { mutate: join } = useManagedMutation<unknown, unknown, void>({
    mutationFn: () => matrixRoomsJoin({ path: { uuid: row.uuid } }),
    successMessage: translate('You are joining the room.'),
    errorMessage: translate('Unable to join the room.'),
    refetch,
    // Drop the cached rooms table so the Join/Leave toggle reflects the new
    // membership. Key must match the `table` prop in MatrixAdminRoomsList.
    invalidateQueries: [{ queryKey: ['table', 'matrix-admin-rooms'] }],
    closeModal: false,
  });

  const { mutate: leave } = useManagedMutation<unknown, unknown, void>({
    mutationFn: () => matrixRoomsLeave({ path: { uuid: row.uuid } }),
    successMessage: translate('You are leaving the room.'),
    errorMessage: translate('Unable to leave the room.'),
    refetch,
    invalidateQueries: [{ queryKey: ['table', 'matrix-admin-rooms'] }],
    closeModal: false,
  });

  return (
    <ActionItem
      title={isMember ? translate('Leave room') : translate('Join room')}
      action={() => (isMember ? leave() : join())}
      iconNode={
        isMember ? <SignOutIcon weight="bold" /> : <SignInIcon weight="bold" />
      }
      disabled={row.state !== 'active'}
      tooltip={
        row.state !== 'active'
          ? translate('Room must be active to join or leave.')
          : undefined
      }
    />
  );
};

export const OpenInTeamChatButton: FC<MatrixRoomActionsProps> = ({ row }) => {
  const { openDrawer } = useDrawer();

  const handleOpen = useCallback(() => {
    openUnifiedChatDrawer(openDrawer, {
      defaultRoomUuid: row.uuid,
      matrixRoomAlias: row.room_alias,
    });
  }, [openDrawer, row.uuid, row.room_alias]);

  const member = isRoomMember(row);

  return (
    <ActionItem
      title={translate('Open in team chat')}
      action={handleOpen}
      iconNode={<ChatsCircleIcon weight="bold" />}
      disabled={row.state !== 'active' || !member}
      tooltip={
        row.state !== 'active'
          ? translate('Room must be active to open chat.')
          : !member
            ? translate('Join the room first to open the chat.')
            : undefined
      }
    />
  );
};

export const SyncMembersButton: FC<MatrixRoomActionsProps> = ({
  row,
  refetch,
}) => {
  const { mutate: syncMembers } = useManagedMutation<unknown, unknown, void>({
    mutationFn: () => matrixRoomsSyncMembers({ path: { uuid: row.uuid } }),
    successMessage: translate('Member sync has been initiated.'),
    errorMessage: translate('Unable to sync members.'),
    refetch,
    closeModal: false,
  });

  return (
    <ActionItem
      title={translate('Sync members')}
      action={() => syncMembers()}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      disabled={row.state !== 'active'}
      tooltip={
        row.state !== 'active'
          ? translate('Room must be active to sync members.')
          : undefined
      }
    />
  );
};

export const ExportHistoryButton: FC<MatrixRoomActionsProps> = ({
  row,
  refetch,
}) => {
  const { mutate: exportHistory } = useManagedMutation<unknown, unknown, void>({
    mutationFn: () => matrixRoomsExportHistory({ path: { uuid: row.uuid } }),
    successMessage: translate('History export has been initiated.'),
    errorMessage: translate('Unable to export history.'),
    refetch,
    invalidateQueries: [{ queryKey: ['table', `matrix-exports-${row.uuid}`] }],
    closeModal: false,
  });

  return (
    <ActionItem
      title={translate('Export history')}
      action={() => exportHistory()}
      iconNode={<ExportIcon weight="bold" />}
      disabled={row.state !== 'active'}
      tooltip={
        row.state !== 'active'
          ? translate('Room must be active to export history.')
          : undefined
      }
    />
  );
};

export const RetryRoomButton: FC<MatrixRoomActionsProps> = ({
  row,
  refetch,
}) => {
  const { mutate: retry } = useManagedMutation<unknown, unknown, void>({
    mutationFn: () => matrixRoomsRetry({ path: { uuid: row.uuid } }),
    successMessage: translate('Retry has been triggered.'),
    errorMessage: translate('Unable to retry room operation.'),
    refetch,
    closeModal: false,
  });

  const canRetry =
    row.state === 'error' ||
    row.state === 'creating' ||
    row.state === 'disabling';

  return (
    <ActionItem
      title={translate('Retry')}
      action={() => retry()}
      iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
      disabled={!canRetry}
      tooltip={
        !canRetry
          ? translate(
              'Room must be in error, creating or disabling state to retry.',
            )
          : undefined
      }
    />
  );
};

export const DisableChatButton: FC<MatrixRoomActionsProps> = ({
  row,
  refetch,
}) => {
  const { openDialog } = useModal();

  const handleDisable = useCallback(() => {
    openDialog(DisableChatRoomDialog, {
      resolve: { room: row, refetch },
    });
  }, [openDialog, row, refetch]);

  const state = row.state;
  const canDisable = state === 'active' || state === 'error';

  return (
    <ActionItem
      title={translate('Disable chat')}
      action={handleDisable}
      iconNode={<PowerIcon weight="bold" />}
      className="text-danger"
      disabled={!canDisable}
      tooltip={
        !canDisable
          ? translate('Room must be active or in error state to disable.')
          : undefined
      }
    />
  );
};

export const ReactivateChatButton: FC<MatrixRoomActionsProps> = ({
  row,
  refetch,
}) => {
  const reactivateConfirmation = useMemo(
    () => ({
      title: translate('Re-enable chat room'),
      body: translate(
        'Are you sure you want to re-enable this chat room? All project members will be re-invited.',
      ),
    }),
    [],
  );

  const { mutate: reactivate } = useManagedMutation<unknown, unknown, void>({
    mutationFn: () => matrixRoomsReactivate({ path: { uuid: row.uuid } }),
    successMessage: translate('Chat room is being re-enabled.'),
    errorMessage: translate('Unable to re-enable chat room.'),
    refetch,
    closeModal: false,
    confirmation: reactivateConfirmation,
  });

  return (
    <ActionItem
      title={translate('Re-enable chat')}
      action={() => reactivate()}
      iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
      disabled={row.state !== 'archived'}
      tooltip={
        row.state !== 'archived'
          ? translate('Room must be archived to re-enable.')
          : undefined
      }
    />
  );
};

export const DeleteRoomButton: FC<MatrixRoomActionsProps> = ({
  row,
  refetch,
}) => {
  const deleteConfirmation = useMemo(
    () => ({
      title: translate('Delete chat room'),
      body: translate(
        'Are you sure you want to delete this chat room? This action cannot be undone.',
      ),
    }),
    [],
  );

  const { mutate: deleteRoom } = useManagedMutation<unknown, unknown, void>({
    mutationFn: () => matrixRoomsDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate('Chat room has been deleted.'),
    errorMessage: translate('Unable to delete chat room.'),
    refetch,
    closeModal: false,
    confirmation: deleteConfirmation,
  });

  return (
    <ActionItem
      title={translate('Delete')}
      action={() => deleteRoom()}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
    />
  );
};
