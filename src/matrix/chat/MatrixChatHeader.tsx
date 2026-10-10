import {
  ArrowLeftIcon,
  BellIcon,
  BellSlashIcon,
  ChatsCircleIcon,
  PhoneDisconnectIcon,
  PhoneIcon,
} from '@phosphor-icons/react';
import { FC, useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  BaseButton,
  Menu,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
} from 'waldur-ui';

import Avatar from '@/core/Avatar';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { MatrixCredentialsDialog } from '@/matrix/MatrixJoinButton';
import { canOpenInExternalClient } from '@/matrix/utils';
import { useModal } from '@/modal/actions';
import { HeaderButtonBullet } from '@/navigation/header/HeaderButtonBullet';
import { useNotify } from '@/store/notify';
import { ActionsMenu } from '@/table/ActionsDropdown';

import { useMatrixCall } from './call/useMatrixCall';
import { getChatAvatarColor } from './chatColors';
import { MatrixMembersList } from './MatrixMembersList';
import { isRoomMuted, setRoomMuted } from './mute';
import { useMatrixClient } from './useMatrixClient';
import { useMatrixTotalUnread } from './useMatrixTotalUnread';
import { useRoomMembers } from './useRoomMembers';

interface MatrixChatHeaderProps {
  roomUuid: string;
  roomName: string;
  roomAlias?: string | null;
  /** Project UUID the room is scoped to — turns the name into a link. */
  projectUuid?: string | null;
  onBack?: () => void;
}

/**
 * Compact chat-window header (design "H2 Final"): avatar, room name, a
 * members popover trigger and a kebab menu. Drawer chrome (close/expand)
 * stays on the Metronic drawer that wraps this panel.
 */
export const MatrixChatHeader: FC<MatrixChatHeaderProps> = ({
  roomUuid,
  roomName,
  roomAlias,
  projectUuid,
  onBack,
}) => {
  const members = useRoomMembers();
  const { rtcAvailable, callState, callRoomUuid, startCall, endCall } =
    useMatrixCall();
  const { client, activeRoomId, activeRoomUuid, connectionState } =
    useMatrixClient();
  const { showSuccess, showError } = useNotify();
  const { openDialog } = useModal();

  // Compact view hides the room list behind the back button, so flag when any
  // other room has unread the user can't currently see.
  const otherRoomsUnread = useMatrixTotalUnread(activeRoomId);

  // In single-chat (AI-off) mode the drawer's floating expand/close controls
  // overlap the chat header, so the room kebab is portaled into that toolbar
  // row instead. The slot only exists in the unified drawer's single mode;
  // anywhere else (AI tab present, or the full-page Communication view) the
  // kebab stays inline. Queried without `:has()` so jsdom can run it in tests.
  const [toolbarSlot, setToolbarSlot] = useState<HTMLElement | null>(null);
  // Re-resolve when the room context changes, not on every render. The slot
  // is owned by the unified drawer and only changes when the drawer mode
  // (single vs. tabbed) flips, which happens at mount/route-level —
  // running this on every render churned through document.getElementById +
  // querySelector every animation frame.
  useLayoutEffect(() => {
    const drawer = document.getElementById('kt_drawer');
    const single = drawer?.querySelector('.unified-chat-drawer--single');
    setToolbarSlot(
      single
        ? (drawer!.querySelector(
            '#kt_drawer_header .card-toolbar',
          ) as HTMLElement | null)
        : null,
    );
  }, [roomUuid]);

  const color = getChatAvatarColor(roomUuid);
  const inCall = callState === 'connecting' || callState === 'connected';
  const isThisRoomsCall = inCall && callRoomUuid === roomUuid;
  // A call exists, but in a different room — start-call is blocked until the
  // user hangs up the active one.
  const blockedByOtherCall = inCall && !isThisRoomsCall;
  const busy = callState === 'discovering' || callState === 'connecting';
  // Mute reads push rules, which only exist once the initial sync completes;
  // gate on 'connected' so a pre-sync client (e.g. mid-impersonation reconnect)
  // can't trigger the SDK's "SyncApi.sync() must be done" throw. The
  // activeRoomUuid match guards the room-switch lag where it trails the props.
  const muteReady = Boolean(
    client &&
    connectionState === 'connected' &&
    activeRoomId &&
    activeRoomUuid === roomUuid,
  );

  const [muted, setMuted] = useState(false);
  useEffect(() => {
    if (!muteReady || !client || !activeRoomId) {
      setMuted(false);
      return;
    }
    const sync = () => setMuted(isRoomMuted(client, activeRoomId));
    sync();
    client.on('accountData' as any, sync);
    return () => {
      client.removeListener('accountData' as any, sync);
    };
  }, [muteReady, client, activeRoomId]);

  const handleCall = () => {
    if (busy || blockedByOtherCall) return;
    if (isThisRoomsCall) endCall();
    else startCall();
  };

  // Waldur provisioned the user's Matrix account, so show how to sign in to it
  // before handing the room over.
  const handleOpenExternal = () =>
    openDialog(MatrixCredentialsDialog, { resolve: { roomAlias }, size: 'lg' });
  const showExternal = Boolean(roomAlias) && canOpenInExternalClient();

  const handleMute = async () => {
    if (!muteReady || !client || !activeRoomId) return;
    const next = !muted;
    try {
      await setRoomMuted(client, activeRoomId, next);
      setMuted(next);
      showSuccess(next ? translate('Muted.') : translate('Unmuted.'));
    } catch {
      showError(translate('Could not update mute setting.'));
    }
  };

  const kebab = (
    <ActionsMenu size="sm">
      <Menu.Item
        icon={
          muted ? <BellIcon weight="bold" /> : <BellSlashIcon weight="bold" />
        }
        onSelect={handleMute}
      >
        {muted ? translate('Unmute') : translate('Mute')}
      </Menu.Item>
      {(rtcAvailable || showExternal) && <Menu.Separator />}
      {rtcAvailable &&
        (blockedByOtherCall ? (
          <Tooltip
            label={translate(
              'Disconnect from the current call before starting a new one.',
            )}
            side="left"
          >
            <span>
              <Menu.Item disabled icon={<PhoneIcon weight="bold" />}>
                {translate('Start call')}
              </Menu.Item>
            </span>
          </Tooltip>
        ) : (
          <Menu.Item
            icon={
              isThisRoomsCall ? (
                <PhoneDisconnectIcon weight="bold" />
              ) : (
                <PhoneIcon weight="bold" />
              )
            }
            onSelect={handleCall}
            disabled={busy}
            className={isThisRoomsCall ? 'text-danger' : undefined}
          >
            {isThisRoomsCall ? translate('End call') : translate('Start call')}
          </Menu.Item>
        ))}
      {showExternal && (
        <Menu.Item
          icon={<ChatsCircleIcon weight="bold" />}
          onSelect={handleOpenExternal}
        >
          {translate('Open in external Matrix client')}
        </Menu.Item>
      )}
    </ActionsMenu>
  );

  return (
    <div className="tc-header">
      {onBack && (
        <div className="position-relative d-inline-flex">
          <BaseButton
            variant="text-secondary"
            size="sm"
            onClick={onBack}
            tooltip={translate('Back to room list')}
            iconNode={<ArrowLeftIcon size={18} weight="bold" />}
          />
          {otherRoomsUnread > 0 && <HeaderButtonBullet />}
        </div>
      )}

      <Avatar
        name={roomName}
        size={40}
        circle
        labelClassName={`bg-light-${color} text-${color}`}
      />

      <div
        className="d-flex align-items-baseline gap-1 flex-grow-1"
        style={{ minWidth: 0 }}
      >
        {projectUuid ? (
          <Link
            state="project.dashboard"
            params={{ uuid: projectUuid }}
            label={roomName}
            className="fw-semibold text-truncate"
          />
        ) : (
          <span className="fw-semibold text-truncate">{roomName}</span>
        )}
        {members.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className="tc-header-members">
                {'· '}
                {translate('{count} members', { count: members.length })}
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="start"
              sideOffset={2}
              className="tc-members-popover"
            >
              <MatrixMembersList />
            </PopoverContent>
          </Popover>
        )}
      </div>

      {toolbarSlot ? (
        createPortal(
          <span className="tc-toolbar-kebab">{kebab}</span>,
          toolbarSlot,
        )
      ) : (
        <div className="tc-header-kebab">{kebab}</div>
      )}
    </div>
  );
};
