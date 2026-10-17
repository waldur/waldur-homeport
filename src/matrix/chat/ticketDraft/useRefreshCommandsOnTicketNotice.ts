import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';

import { ROOM_COMMANDS_QUERY_KEY } from '../commands/queryKeys';
import { MatrixChatMessage } from '../types';

import { isTicketNotice } from './parseTicketDraft';

const latestTicketNotice = (
  messages: MatrixChatMessage[],
  roomBotUserId: string | null,
): string | undefined => {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (isTicketNotice(m.sender, m.type, m.assistantBlocks, roomBotUserId)) {
      return m.eventId;
    }
  }
  return undefined;
};

/**
 * The composer's bot commands change with the user's open drafts, so a
 * draft, ticket or cancellation the bot posts while the room is open
 * refreshes them. The notices a room opens with are not news: its command
 * list is fetched with the room.
 */
export function useRefreshCommandsOnTicketNotice(
  messages: MatrixChatMessage[],
  roomBotUserId: string | null,
  loading: boolean,
) {
  const queryClient = useQueryClient();
  const latest = useMemo(
    () => latestTicketNotice(messages, roomBotUserId),
    [messages, roomBotUserId],
  );
  const seen = useRef({ latest, loaded: !loading });
  useEffect(() => {
    const previous = seen.current;
    seen.current = { latest, loaded: !loading };
    if (loading || !previous.loaded || !latest || latest === previous.latest) {
      return;
    }
    queryClient.invalidateQueries({ queryKey: ROOM_COMMANDS_QUERY_KEY });
  }, [latest, loading, queryClient]);
}
