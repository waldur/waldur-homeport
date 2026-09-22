import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { FC, Fragment, useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { MatrixRoom } from 'waldur-js-client';

import { IconButton } from '@/core/buttons/IconButton';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { StateIndicator } from '@/core/StateIndicator';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
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
import { useModal } from '@/modal/actions';
import { NoResult } from '@/navigation/header/search/NoResult';
import { ActionButton } from '@/table/ActionButton';
import { ActionDropdownButton } from '@/table/ActionDropdownButton';
import { ActionsDropdownSeparator } from '@/table/ActionsDropdown';
import { renderFieldOrDash } from '@/table/utils';
import {
  getProject,
  isOwnerOrStaff as isOwnerOrStaffSelector,
  isStaff as isStaffSelector,
} from '@/workspace/selectors';

// Lifecycle is staff-only here, deliberately stricter than the API.
// Menu order is by cost: sync → connect (provisions, mints a token) →
// disable → delete. One action is promoted beside it: the conversation while
// healthy, otherwise whatever fixes the current state.
const RoomActions: FC<{
  room: MatrixRoom;
  isOwnerOrStaff: boolean;
  staff: boolean;
  refetch(): void;
}> = ({ room, isOwnerOrStaff, staff, refetch }) => {
  const isActive = room.state === 'active';
  const canSync = isOwnerOrStaff && isActive;
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
    isActive && (
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
          as={ActionButton}
          variant="secondary"
        />
      )}
      {groups.length > 0 && (
        <ActionDropdownButton title={translate('All actions')} align="end">
          {groups.map((item, index) => (
            <Fragment key={index}>
              {index > 0 && <ActionsDropdownSeparator />}
              {item}
            </Fragment>
          ))}
        </ActionDropdownButton>
      )}
    </div>
  );
};

const HistoryExportsCard: FC<{
  room: MatrixRoom;
  isOwnerOrStaff: boolean;
  refetch(): void;
}> = ({ room, isOwnerOrStaff, refetch }) => {
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
            <IconButton
              iconNode={<ArrowsClockwiseIcon weight="bold" />}
              tooltip={translate(
                'Refresh is available when the room is active — no history exports can be produced in the current state.',
              )}
              onClick={() => undefined}
              variant="text-secondary"
              disabled
            />
          )}
          {isOwnerOrStaff && isActive && (
            <ExportHistoryButton
              row={room}
              refetch={refetch}
              as={ActionButton}
            />
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
  isOwnerOrStaff: boolean;
  staff: boolean;
  refetch(): void;
}> = ({ room, isOwnerOrStaff, staff, refetch }) => (
  <>
    <FormTable.Card
      title={translate('Chat room')}
      className="card-bordered mb-6"
      actions={
        <RoomActions
          room={room}
          isOwnerOrStaff={isOwnerOrStaff}
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

    <HistoryExportsCard
      room={room}
      isOwnerOrStaff={isOwnerOrStaff}
      refetch={refetch}
    />
  </>
);

export const ProjectMatrixChat: FC = () => {
  const project = useSelector(getProject);
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
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
    return (
      <NoResult
        title={translate('No chat room')}
        message={
          staff
            ? translate(
                'No chat room has been created for this project yet. Create one to enable team communication via Matrix.',
              )
            : translate('No chat room has been created for this project.')
        }
        callback={staff ? openCreateDialog : undefined}
        buttonTitle={staff ? translate('Create chat room') : undefined}
      />
    );
  }

  return (
    <RoomDetails
      room={room}
      isOwnerOrStaff={isOwnerOrStaff}
      staff={staff}
      refetch={refetch}
    />
  );
};
