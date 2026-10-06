import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { FC, Fragment, useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { MatrixRoom } from 'waldur-js-client';

import { BaseButton, Menu } from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { StateIndicator } from '@/core/StateIndicator';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { canCreateMatrixRoom } from '@/matrix/canCreateMatrixRoom';
import { canManageMatrixRoom } from '@/matrix/canManageMatrixRoom';
import { useProjectMatrixRooms } from '@/matrix/chat/useProjectMatrixRooms';
import { CreateMatrixRoomDialog } from '@/matrix/CreateMatrixRoomDialog';
import { MatrixExportsList } from '@/matrix/MatrixExportsList';
import {
  DeleteRoomButton,
  DisableChatButton,
  ExportHistoryButton,
  OpenInMatrixButton,
  OpenInTeamChatButton,
  ReactivateChatButton,
  RetryRoomButton,
  SyncMembersButton,
} from '@/matrix/MatrixRoomActions';
import { ROOM_STATE_VARIANT, stateLabel } from '@/matrix/MatrixRoomStateBadge';
import { canOpenInExternalClient } from '@/matrix/utils';
import { useModal } from '@/modal/actions';
import { NoResult } from '@/navigation/header/search/NoResult';
import { renderFieldOrDash } from '@/table/utils';
import {
  getProject,
  getUser,
  isStaff as isStaffSelector,
} from '@/workspace/selectors';

// Lifecycle after creation is staff-only here, deliberately stricter than the API.
// Menu order is by cost: sync → connect (hands the room to an external
// client) → disable → delete. One action is promoted beside it: the conversation while
// healthy, otherwise whatever fixes the current state.
const RoomActions: FC<{
  room: MatrixRoom;
  canManage: boolean;
  staff: boolean;
  refetch(): void;
}> = ({ room, canManage, staff, refetch }) => {
  const isActive = room.state === 'active';
  const canSync = canManage && isActive;
  const canRetry =
    staff &&
    (room.state === 'creating' ||
      room.state === 'disabling' ||
      room.state === 'error');
  const canReactivate = staff && room.state === 'archived';
  const canDisable = staff && (isActive || room.state === 'error');
  const canDelete =
    staff && (room.state === 'error' || room.state === 'archived');

  // At most one is ever available: the three state tests are disjoint.
  const PromotedAction = isActive
    ? OpenInTeamChatButton
    : canRetry
      ? RetryRoomButton
      : canReactivate
        ? ReactivateChatButton
        : null;

  const groups = [
    canSync && <SyncMembersButton key="sync" row={room} refetch={refetch} />,
    // Gated here as well as in the button: a null item would still count
    // towards the menu and its separators.
    isActive && canOpenInExternalClient() && (
      <OpenInMatrixButton key="matrix" row={room} refetch={refetch} />
    ),
    canDisable && (
      <DisableChatButton key="disable" row={room} refetch={refetch} />
    ),
    canDelete && <DeleteRoomButton key="delete" row={room} refetch={refetch} />,
  ].filter(Boolean);

  if (!PromotedAction && groups.length === 0) return null;

  return (
    <div className="d-flex align-items-center gap-2">
      {PromotedAction && (
        <PromotedAction
          row={room}
          refetch={refetch}
          as={BaseButton}
          variant="secondary"
        />
      )}
      {groups.length > 0 && (
        <Menu>
          <Menu.TriggerButton size="lg">
            {translate('All actions')}
          </Menu.TriggerButton>
          <Menu.Content look="actions" side="bottom" align="end">
            {groups.map((item, index) => (
              <Fragment key={index}>
                {index > 0 && <Menu.Separator />}
                {item}
              </Fragment>
            ))}
          </Menu.Content>
        </Menu>
      )}
    </div>
  );
};

const HistoryExportsCard: FC<{
  room: MatrixRoom;
  refetch(): void;
}> = ({ room, refetch }) => {
  const [refreshSlot, setRefreshSlot] = useState<HTMLDivElement | null>(null);
  // No exports are ever produced on a non-active room, so refetching is a
  // no-op. The room can transition back to active, so disable with an
  // explanatory tooltip rather than hiding the control entirely.
  const isActive = room.state === 'active';
  // The portal-mounted TableRefreshButton has no `disabled` prop. Only
  // expose the portal slot when the action is meaningful; otherwise the
  // disabled-with-tooltip placeholder below takes its place.
  const portal = useMemo(
    () => (refreshSlot && isActive ? { refresh: refreshSlot } : undefined),
    [refreshSlot, isActive],
  );
  return (
    <FormTable.Card
      title={translate('History exports')}
      className="card-bordered"
      actions={
        <div className="d-flex align-items-center gap-2">
          {isActive ? (
            <div ref={setRefreshSlot} className="d-flex align-items-center" />
          ) : (
            <BaseButton
              iconNode={<ArrowsClockwiseIcon weight="bold" />}
              tooltip={translate(
                'Refresh is available when the room is active — no history exports can be produced in the current state.',
              )}
              onClick={() => undefined}
              variant="text-secondary"
              disabled
              size="lg"
            />
          )}
          {isActive && (
            <ExportHistoryButton row={room} refetch={refetch} as={BaseButton} />
          )}
        </div>
      }
    >
      <MatrixExportsList
        room_uuid={room.uuid}
        hasActionBar={false}
        portal={portal}
      />
    </FormTable.Card>
  );
};

const RoomDetails: FC<{
  room: MatrixRoom;
  canManage: boolean;
  staff: boolean;
  refetch(): void;
}> = ({ room, canManage, staff, refetch }) => (
  <>
    <FormTable.Card
      title={translate('Chat room')}
      className="card-bordered mb-6"
      actions={
        <RoomActions
          room={room}
          canManage={canManage}
          staff={staff}
          refetch={refetch}
        />
      }
    >
      <FormTable>
        <FormTable.Item label={translate('Room name')} value={room.room_name} />
        <FormTable.Item
          label={translate('State')}
          value={
            <StateIndicator
              label={stateLabel(room.state)}
              variant={ROOM_STATE_VARIANT[room.state] || 'neutral'}
              active={room.state === 'creating' || room.state === 'disabling'}
              shape="pill"
              tone="outline"
            />
          }
        />
        {room.error_message && (
          <FormTable.Item
            label={translate('Error')}
            value={<span className="text-danger">{room.error_message}</span>}
          />
        )}
        <FormTable.Item
          label={translate('Room alias')}
          value={renderFieldOrDash(room.room_alias)}
        />
        <FormTable.Item
          label={translate('Members')}
          value={room.members_count}
        />
      </FormTable>
    </FormTable.Card>

    {/* The API lists exports only for those who manage the room. */}
    {canManage && <HistoryExportsCard room={room} refetch={refetch} />}
  </>
);

export const ProjectMatrixChat: FC = () => {
  const project = useSelector(getProject);
  const user = useSelector(getUser);
  const staff = useSelector(isStaffSelector);
  const { openDialog } = useModal();

  const {
    data: rooms,
    isLoading,
    error,
    refetch: refetchQuery,
  } = useProjectMatrixRooms(project?.uuid);

  const refetch = useCallback(async () => {
    await refetchQuery();
  }, [refetchQuery]);

  const room = rooms?.[0];

  const openCreateDialog = useCallback(() => {
    openDialog(CreateMatrixRoomDialog, {
      resolve: {
        projectUuid: project.uuid,
        projectName: project.name,
        refetch,
      },
    });
  }, [openDialog, project, refetch]);

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <LoadingErred
        message={translate('Unable to load chat room.')}
        loadData={refetch}
      />
    );

  if (!room) {
    const canCreate = canCreateMatrixRoom(user, project);
    return (
      <NoResult
        title={translate('No chat room')}
        message={
          canCreate
            ? translate(
                'No chat room has been created for this project yet. Create one to enable team communication via Matrix.',
              )
            : translate('No chat room has been created for this project.')
        }
        callback={canCreate ? openCreateDialog : undefined}
        buttonTitle={canCreate ? translate('Create chat room') : undefined}
      />
    );
  }

  return (
    <RoomDetails
      room={room}
      canManage={canManageMatrixRoom(user, project)}
      staff={staff}
      refetch={refetch}
    />
  );
};
