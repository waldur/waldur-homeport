import {
  ArrowLeftIcon,
  BellIcon,
  BellSlashIcon,
  ChatsCircleIcon,
  PhoneDisconnectIcon,
  PhoneIcon,
} from '@phosphor-icons/react';
import { FC, useEffect, useLayoutEffect, useState } from 'react';
import { Dropdown, OverlayTrigger, Popover } from 'react-bootstrap';
import { createPortal } from 'react-dom';

import Avatar from '@/core/Avatar';
import { Link } from '@/core/Link';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { HeaderButtonBullet } from '@/navigation/header/HeaderButtonBullet';
import { useNotify } from '@/store/notify';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';

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
  const matrixUri = roomAlias
    ? `matrix:r/${roomAlias.replace(/^#/, '')}`
    : null;
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
    <ActionsDropdownComponent size="sm">
      <Dropdown.Item onClick={handleMute}>
        {muted ? (
          <BellIcon size={18} className="me-2" weight="bold" />
        ) : (
          <BellSlashIcon size={18} className="me-2" weight="bold" />
        )}
        {muted ? translate('Unmute') : translate('Mute')}
      </Dropdown.Item>
      {(rtcAvailable || matrixUri) && <Dropdown.Divider />}
      {rtcAvailable &&
        (blockedByOtherCall ? (
          <Tip
            id="tc-start-call-blocked"
            label={translate(
              'Disconnect from the current call before starting a new one.',
            )}
            placement="left"
          >
            <span>
              <Dropdown.Item
                onClick={(e) => e.preventDefault()}
                disabled
                style={{ pointerEvents: 'none' }}
              >
                <PhoneIcon size={18} className="me-2" weight="bold" />
                {translate('Start call')}
              </Dropdown.Item>
            </span>
          </Tip>
        ) : (
          <Dropdown.Item
            onClick={handleCall}
            disabled={busy}
            className={isThisRoomsCall ? 'text-danger' : undefined}
          >
            {isThisRoomsCall ? (
              <PhoneDisconnectIcon size={18} className="me-2" weight="bold" />
            ) : (
              <PhoneIcon size={18} className="me-2" weight="bold" />
            )}
            {isThisRoomsCall ? translate('End call') : translate('Start call')}
          </Dropdown.Item>
        ))}
      {matrixUri && (
        <Dropdown.Item href={matrixUri} target="_blank" rel="noreferrer">
          <ChatsCircleIcon size={18} className="me-2" weight="bold" />
          {translate('Open in external Matrix client')}
        </Dropdown.Item>
      )}
    </ActionsDropdownComponent>
  );

  return (
    <div className="tc-header d-flex align-items-center gap-2 px-4 py-2 border-bottom">
      {onBack && (
        <button
          type="button"
          className="position-relative btn btn-sm btn-icon btn-text-secondary"
          onClick={onBack}
          title={translate('Back to room list')}
        >
          <ArrowLeftIcon size={18} weight="bold" />
          {otherRoomsUnread > 0 && <HeaderButtonBullet />}
        </button>
      )}

      <Avatar
        name={roomName}
        size={32}
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
          <OverlayTrigger
            trigger="click"
            rootClose
            transition={false}
            placement="bottom-start"
            overlay={
              <Popover id="tc-members-popover" className="tc-members-popover">
                <Popover.Body className="p-0">
                  <MatrixMembersList />
                </Popover.Body>
              </Popover>
            }
          >
            <button type="button" className="tc-header-members">
              {'· '}
              {translate('{count} members', { count: members.length })}
            </button>
          </OverlayTrigger>
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
