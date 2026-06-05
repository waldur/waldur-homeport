import { FC, useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { MatrixRoom } from 'waldur-js-client';

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
import { ROOM_STATE_VARIANT } from '@/matrix/MatrixRoomStateBadge';
import { useModal } from '@/modal/actions';
import { NoResult } from '@/navigation/header/search/NoResult';
import { renderFieldOrDash } from '@/table/utils';
import {
  getProject,
  isOwnerOrStaff as isOwnerOrStaffSelector,
  isStaff as isStaffSelector,
} from '@/workspace/selectors';

// Demo policy: owners may sync members and export history on an active room,
// but room lifecycle (disable, retry, re-enable, delete) is staff-only.
const RoomActions: FC<{
  room: MatrixRoom;
  isOwnerOrStaff: boolean;
  staff: boolean;
  refetch(): void;
}> = ({ room, isOwnerOrStaff, staff, refetch }) => (
  <div className="d-flex gap-1 flex-wrap">
    {room.state === 'active' && (
      <OpenInTeamChatButton row={room} refetch={refetch} />
    )}
    {room.state === 'active' && (
      <OpenInMatrixButton row={room} refetch={refetch} />
    )}
    {isOwnerOrStaff && room.state === 'active' && (
      <SyncMembersButton row={room} refetch={refetch} />
    )}
    {staff && room.state === 'active' && (
      <DisableChatButton row={room} refetch={refetch} />
    )}
    {staff && room.state === 'creating' && (
      <RetryRoomButton row={room} refetch={refetch} />
    )}
    {staff && room.state === 'error' && (
      <>
        <RetryRoomButton row={room} refetch={refetch} />
        <DisableChatButton row={room} refetch={refetch} />
        <DeleteRoomButton row={room} refetch={refetch} />
      </>
    )}
    {staff && room.state === 'archived' && (
      <>
        <ReactivateChatButton row={room} refetch={refetch} />
        <DeleteRoomButton row={room} refetch={refetch} />
      </>
    )}
  </div>
);

const HistoryExportsCard: FC<{
  room: MatrixRoom;
  isOwnerOrStaff: boolean;
  refetch(): void;
}> = ({ room, isOwnerOrStaff, refetch }) => {
  const [refreshSlot, setRefreshSlot] = useState<HTMLDivElement | null>(null);
  const portal = useMemo(
    () => (refreshSlot ? { refresh: refreshSlot } : undefined),
    [refreshSlot],
  );
  return (
    <FormTable.Card
      title={translate('History exports')}
      className="card-bordered"
      actions={
        <div className="d-flex align-items-center gap-2">
          <div ref={setRefreshSlot} className="d-flex align-items-center" />
          {isOwnerOrStaff && room.state === 'active' && (
            <ExportHistoryButton row={room} refetch={refetch} />
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
              label={room.state}
              variant={ROOM_STATE_VARIANT[room.state] || 'default'}
              active={room.state === 'creating' || room.state === 'disabling'}
              pill
              outline
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
