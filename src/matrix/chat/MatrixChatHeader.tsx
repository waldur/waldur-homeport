import {
  ArrowLeftIcon,
  BellIcon,
  BellSlashIcon,
  ChatsCircleIcon,
  PhoneDisconnectIcon,
  PhoneIcon,
  TerminalWindowIcon,
} from '@phosphor-icons/react';
import { FC, ReactNode, useEffect, useState } from 'react';

import {
  Avatar,
  Badge,
  BaseButton,
  Menu,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
} from 'waldur-ui';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { MatrixCredentialsDialog } from '@/matrix/MatrixJoinButton';
import { canOpenInExternalClient } from '@/matrix/utils';
import { useModal } from '@/modal/actions';
import { HeaderButtonBullet } from '@/navigation/header/HeaderButtonBullet';
import { useNotify } from '@/store/notify';
import { ActionsMenu } from '@/table/ActionsDropdown';

import { useCallAvailability } from './call/useCallAvailability';
import { useMatrixCall } from './call/useMatrixCall';
import { getChatAvatarClass } from './chatColors';
import { ComposerCommand } from './commands/composerCommands';
import { MatrixCommandsDialog } from './commands/MatrixCommandsDialog';
import { useComposerCommands } from './commands/useComposerCommands';
import { DiscussionMaterials, useRoomDiscussion } from './DiscussionMaterials';
import { MatrixMembersList } from './MatrixMembersList';
import { useMatrixMessageActions } from './MatrixMessageActionsContext';
import {
  getRoomNotificationLevel,
  RoomNotificationLevel,
  setRoomNotificationLevel,
} from './notificationLevel';
import { DISCUSSION_ROOM, RoomAvatar } from './roomKind';
import { useMatrixClient } from './useMatrixClient';
import { useMatrixTotalUnread } from './useMatrixTotalUnread';
import { useRoomMembers } from './useRoomMembers';

// The actions look has no checked style of its own: highlight the current
// level as the nav look does.
const CHECKED_LEVEL_CLASSNAME =
  'data-[state=checked]:bg-[var(--menu-item-hover-bg)]';

/**
 * The room's name in the header, cut off where it does not fit; the full
 * name then shows on hover. Whether it is cut off is asked as the pointer or
 * focus arrives: the drawer's width settles after the header mounts.
 */
const RoomName: FC<{ name: string; children: ReactNode }> = ({
  name,
  children,
}) => {
  const [cutOff, setCutOff] = useState(false);
  const check = (event: { currentTarget: HTMLElement }) => {
    const element = event.currentTarget;
    setCutOff(element.scrollWidth > element.clientWidth);
  };
  return (
    <span
      className="truncate min-w-0"
      title={cutOff ? name : undefined}
      onPointerEnter={check}
      onFocus={check}
      data-testid="chat-header-room-name"
    >
      {children}
    </span>
  );
};

/**
 * A discussion room's title: marked as a discussion, its name linking to the
 * discussion's proposal, or plain for a round's discussion.
 */
const DiscussionTitle: FC<{ uuid: string; roomName: string }> = ({
  uuid,
  roomName,
}) => {
  const { data } = useRoomDiscussion(uuid);
  return (
    <span className="flex items-center gap-1.5 min-w-0">
      <Badge
        variant="info"
        size="sm"
        leftIcon={<ChatsCircleIcon weight="bold" />}
        shape="pill"
        className="shrink-0"
        data-testid="chat-header-discussion"
      >
        {translate('Discussion')}
      </Badge>
      <RoomName name={roomName}>
        {data?.proposal_uuid ? (
          <Link
            state="proposals.manage-proposal"
            params={{ proposal_uuid: data.proposal_uuid }}
            label={roomName}
          />
        ) : (
          roomName
        )}
      </RoomName>
    </span>
  );
};

interface MatrixChatHeaderProps {
  roomUuid: string;
  roomName: string;
  roomAlias?: string | null;
  /** Project UUID the room is scoped to — turns the name into a link. */
  projectUuid?: string | null;
  /** The step discussion the room is for: marks it, and links its proposal. */
  discussionUuid?: string | null;
  onBack?: () => void;
}

/**
 * Compact chat-window header (design "H2 Final"): avatar, room name, a
 * members popover trigger and a kebab menu. Drawer chrome (close/expand)
 * stays on the drawer that wraps this panel.
 */
export const MatrixChatHeader: FC<MatrixChatHeaderProps> = ({
  roomUuid,
  roomName,
  roomAlias,
  projectUuid,
  discussionUuid,
  onBack,
}) => {
  const members = useRoomMembers();
  const { startCall, endCall } = useMatrixCall();
  const call = useCallAvailability(roomUuid);
  const { client, activeRoomId, activeRoomUuid, connectionState } =
    useMatrixClient();
  const { showSuccess, showError } = useNotify();
  const { openDialog } = useModal();
  const { commands } = useComposerCommands();
  const { pickCommand } = useMatrixMessageActions();
  const hasAvailableCommand = commands.some((c) => c.available);
  // One reason for all, such as the bot not running, says more than "none".
  const reasons = new Set(commands.map((c) => c.reason));
  const sharedReason = reasons.size === 1 ? [...reasons][0] : undefined;

  // Compact view hides the room list behind the back button, so flag when any
  // other room has unread the user can't currently see.
  const otherRoomsUnread = useMatrixTotalUnread(activeRoomId);

  // Members and commands follow the active room, so until this room is the
  // active one they are another room's.
  const roomOpen = activeRoomUuid === roomUuid;

  const isThisRoomsCall = call.inThisRoomsCall;
  // The level reads push rules, which only exist once the initial sync
  // completes; gate on 'connected' so a pre-sync client (e.g.
  // mid-impersonation reconnect) can't trigger the SDK's "SyncApi.sync() must
  // be done" throw. The activeRoomUuid match guards the room-switch lag where
  // it trails the props.
  const levelReady = Boolean(
    client &&
    connectionState === 'connected' &&
    activeRoomId &&
    activeRoomUuid === roomUuid,
  );

  const [level, setLevel] = useState<RoomNotificationLevel>('mentions');
  useEffect(() => {
    if (!levelReady || !client || !activeRoomId) {
      setLevel('mentions');
      return;
    }
    const sync = () => setLevel(getRoomNotificationLevel(client, activeRoomId));
    sync();
    // Push rules arrive as global account data, the stored level as the
    // room's.
    client.on('accountData' as any, sync);
    client.on('Room.accountData' as any, sync);
    return () => {
      client.removeListener('accountData' as any, sync);
      client.removeListener('Room.accountData' as any, sync);
    };
  }, [levelReady, client, activeRoomId]);

  const handleCall = () => {
    if (call.busy) return;
    if (isThisRoomsCall) endCall();
    else if (call.canStart) startCall();
  };

  // Waldur provisioned the user's Matrix account, so show how to sign in to it
  // before handing the room over.
  const handleOpenExternal = () =>
    openDialog(MatrixCredentialsDialog, { resolve: { roomAlias }, size: 'lg' });
  const showExternal = Boolean(roomAlias) && canOpenInExternalClient();

  const handleCommands = () =>
    openDialog(MatrixCommandsDialog, {
      resolve: {
        onPick: (command: ComposerCommand) => pickCommand(command.name),
      },
      size: 'lg',
    });

  const handleLevel = async (value: string) => {
    const next = value as RoomNotificationLevel;
    if (!levelReady || !client || !activeRoomId || next === level) return;
    try {
      await setRoomNotificationLevel(client, activeRoomId, next);
      setLevel(next);
      showSuccess(translate('Notification level updated.'));
    } catch {
      showError(translate('Could not update notification level.'));
    }
  };

  const kebab = (
    <ActionsMenu size="sm">
      <Menu.Sub>
        {levelReady ? (
          <Menu.SubTrigger>
            {level === 'mute' ? (
              <BellSlashIcon weight="bold" />
            ) : (
              <BellIcon weight="bold" />
            )}
            {translate('Notifications')}
          </Menu.SubTrigger>
        ) : (
          // Until then the level can't be read, and a pick can't be written.
          <Tooltip
            label={
              roomOpen && connectionState !== 'connected'
                ? translate('Not connected')
                : translate('The conversation is not open yet.')
            }
            side="left"
          >
            <span>
              <Menu.SubTrigger disabled>
                <BellIcon weight="bold" />
                {translate('Notifications')}
              </Menu.SubTrigger>
            </span>
          </Tooltip>
        )}
        <Menu.SubContent>
          <Menu.RadioGroup value={level} onValueChange={handleLevel}>
            <Menu.RadioItem value="all" className={CHECKED_LEVEL_CLASSNAME}>
              {translate('All messages')}
            </Menu.RadioItem>
            <Menu.RadioItem
              value="mentions"
              className={CHECKED_LEVEL_CLASSNAME}
            >
              {translate('Mentions only')}
            </Menu.RadioItem>
            <Menu.RadioItem value="mute" className={CHECKED_LEVEL_CLASSNAME}>
              {translate('Mute')}
            </Menu.RadioItem>
          </Menu.RadioGroup>
        </Menu.SubContent>
      </Menu.Sub>
      {commands.length > 0 &&
        (hasAvailableCommand && roomOpen ? (
          <Menu.Item
            icon={<TerminalWindowIcon weight="bold" />}
            onSelect={handleCommands}
          >
            {translate('Chat commands')}
          </Menu.Item>
        ) : (
          <Tooltip
            label={
              roomOpen
                ? (sharedReason ??
                  translate('No commands are available in this room.'))
                : translate('The conversation is not open yet.')
            }
            side="left"
          >
            <span>
              <Menu.Item disabled icon={<TerminalWindowIcon weight="bold" />}>
                {translate('Chat commands')}
              </Menu.Item>
            </span>
          </Tooltip>
        ))}
      {(call.offered || showExternal) && <Menu.Separator />}
      {call.offered &&
        (!isThisRoomsCall && !call.canStart ? (
          <Tooltip label={call.reason} side="left">
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
            disabled={call.busy}
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
        <div className="relative inline-flex">
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

      {discussionUuid ? (
        <RoomAvatar
          uuid={roomUuid}
          name={roomName}
          scopeType={DISCUSSION_ROOM}
          size={40}
        />
      ) : (
        <Avatar
          name={roomName}
          size={40}
          fallbackClassName={getChatAvatarClass(roomUuid)}
        />
      )}

      <div className="flex items-baseline gap-1 grow min-w-0">
        {discussionUuid ? (
          <DiscussionTitle uuid={discussionUuid} roomName={roomName} />
        ) : projectUuid ? (
          <RoomName name={roomName}>
            <Link
              state="project.dashboard"
              params={{ uuid: projectUuid }}
              label={roomName}
            />
          </RoomName>
        ) : (
          <RoomName name={roomName}>{roomName}</RoomName>
        )}
        {roomOpen && members.length > 0 && (
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
              aria-label={translate('Room members')}
            >
              <MatrixMembersList />
            </PopoverContent>
          </Popover>
        )}
      </div>

      {discussionUuid && <DiscussionMaterials uuid={discussionUuid} />}
      <div>{kebab}</div>
    </div>
  );
};
