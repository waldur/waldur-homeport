import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { OWN_ERROR_STATE } from '@/core/queryRetry';
import { translate } from '@/i18n';
import { isMatrixChatEnabled } from '@/matrix/utils';

import { getCallDeviceId } from '../call/callMembership';
import { useCallAvailability } from '../call/useCallAvailability';
import { useMatrixCall } from '../call/useMatrixCall';
import { useMatrixClient } from '../useMatrixClient';

import { fetchRoomCommands } from './api';
import { ComposerCommand } from './composerCommands';
import { ROOM_COMMANDS_QUERY_KEY } from './queryKeys';

// The bot's commands depend on the room and on the user (role, profile, open
// drafts), so they are asked for per user, and kept fresh while the composer
// is open: a draft made a minute ago enables `ticket send`.
const REFRESH_MS = 60 * 1000;

const CALL_COMMAND = 'call';

/**
 * The commands the composer offers in the active room, each with whether it
 * works for this user now. Nothing is offered unless chat is enabled and the
 * user is connected to a room they belong to.
 *
 * Gating:
 * - every command: Matrix chat enabled (isMatrixChatEnabled), the client
 *   connected, a room open and its membership not refused (useMatrixClient);
 * - bot commands: what the backend says for this user and room
 *   (GET matrix-rooms/{uuid}/commands/: chat and bot running, room active and
 *   linked to a project, room role; for ticket also helpdesk and profile, for
 *   ticket send/cancel an open draft). The bot checks the same when it runs
 *   them;
 * - /call: getCallAvailability (call service advertised, not in another
 *   room's call, browser can encrypt media in an encrypted room, not already
 *   connecting or in this call), the same predicate as the header's call
 *   action. It needs no message decryption, so a locked key store doesn't
 *   hide it, as it doesn't hide the header action.
 */
export function useComposerCommands() {
  const { client, connectionState, activeRoomUuid, roomAccessDenied, userId } =
    useMatrixClient();
  const { callMembers, callRoomUuid, startCall } = useMatrixCall();
  const call = useCallAvailability();

  const roomReady =
    isMatrixChatEnabled() &&
    connectionState === 'connected' &&
    !!activeRoomUuid &&
    !roomAccessDenied;

  const { data: botCommands } = useQuery({
    // Per user: a switch of user (impersonation) must not reuse the list.
    queryKey: [...ROOM_COMMANDS_QUERY_KEY, userId, activeRoomUuid],
    queryFn: () => fetchRoomCommands(activeRoomUuid!),
    enabled: roomReady,
    // Without a list the composer offers no bot commands, and sends a `/`
    // one for the bot to answer.
    meta: OWN_ERROR_STATE,
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: true,
    staleTime: REFRESH_MS / 2,
  });

  // In or after a call, the members are those of the call's room. Your own
  // other devices count, as in the call banner.
  const myDeviceId = getCallDeviceId(client);
  const othersInCall =
    (!callRoomUuid || callRoomUuid === activeRoomUuid) &&
    callMembers.some((m) => m.userId !== userId || m.deviceId !== myDeviceId);
  const commands = useMemo<ComposerCommand[]>(() => {
    if (!roomReady) return [];
    const callCommand: ComposerCommand | null = call.offered
      ? {
          name: CALL_COMMAND,
          description: othersInCall
            ? translate('Join the call in progress')
            : translate('Start a call in this room'),
          source: 'client',
          available: call.canStart,
          reason: call.reason,
        }
      : null;
    return [...(botCommands ?? []), ...(callCommand ? [callCommand] : [])];
  }, [
    roomReady,
    botCommands,
    call.offered,
    call.canStart,
    call.reason,
    othersInCall,
  ]);

  const runClientCommand = useCallback(
    (command: ComposerCommand) => {
      if (command.name === CALL_COMMAND) startCall();
    },
    [startCall],
  );

  // Kept when a later refetch fails: the last list still holds.
  const botCommandsLoaded = botCommands !== undefined;

  return { commands, botCommandsLoaded, runClientCommand };
}
