import { XIcon } from '@phosphor-icons/react';
import {
  Direction,
  MatrixClient,
  MatrixEvent,
  RelationType,
  Room,
} from 'matrix-js-sdk';
import { FC, MouseEvent, useEffect, useRef, useState } from 'react';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';

import {
  getReplacedEventId,
  getRoomEvents,
  indexEdits,
  RELATIONS_PAGE_SIZE,
} from './messageRelations';
import { MatrixChatMessage } from './types';
import { useMatrixClient } from './useMatrixClient';
import {
  getSenderName,
  hasMedia,
  mapEventToMessage,
  UNDECRYPTABLE_MESSAGE_TYPE,
} from './utils';

const HIGHLIGHT_MS = 1500;

/** One line saying what a message is, for a reply's quote of it. */
function getMessagePreview(message: MatrixChatMessage): string {
  if (message.redacted) return translate('Message deleted');
  if (message.type === UNDECRYPTABLE_MESSAGE_TYPE) return message.body;
  if (hasMedia(message)) {
    if (message.isVoice) return translate('Voice message');
    switch (message.type) {
      case 'm.image':
      case 'm.sticker':
        return translate('Image');
      case 'm.video':
        return translate('Video');
      case 'm.audio':
        return translate('Audio');
      default:
        return message.body || translate('File');
    }
  }
  return message.body.replace(/\s+/g, ' ').trim();
}

type ParentState =
  | { status: 'loading' }
  | { status: 'unavailable' }
  | { status: 'loaded'; message: MatrixChatMessage };

async function fetchEvent(
  client: MatrixClient,
  roomId: string,
  eventId: string,
): Promise<MatrixEvent> {
  const event = new MatrixEvent(await client.fetchRoomEvent(roomId, eventId));
  await client.decryptEventIfNeeded(event);
  return event;
}

/**
 * A message outside the loaded timeline, fetched with its edits so the quote
 * shows the newest valid one (not whichever the server bundled). A reply to
 * an edit quotes the message it edits. Also returns the ids whose change
 * (an edit or a deletion) makes the quote stale.
 */
async function resolveParent(
  client: MatrixClient,
  roomId: string,
  parentId: string,
): Promise<{ message: MatrixChatMessage | null; watchIds: string[] }> {
  const room = client.getRoom(roomId) ?? undefined;
  let event = await fetchEvent(client, roomId, parentId);
  const editedId = getReplacedEventId(event);
  if (editedId) event = await fetchEvent(client, roomId, editedId);
  const eventId = event.getId();
  let edits: MatrixEvent[] = [];
  try {
    const { chunk } = await client.fetchRelations(
      roomId,
      eventId,
      RelationType.Replace,
      null,
      { dir: Direction.Backward, limit: RELATIONS_PAGE_SIZE },
    );
    edits = await Promise.all(
      chunk.map(async (raw) => {
        const edit = new MatrixEvent(raw);
        await client.decryptEventIfNeeded(edit);
        return edit;
      }),
    );
  } catch {
    // Shown as last fetched, or unedited.
  }
  const index = indexEdits([...getRoomEvents(room), ...edits]);
  return {
    message: mapEventToMessage(event, room, index),
    watchIds: [eventId, ...(index.get(eventId) ?? []).map((e) => e.getId())],
  };
}

/**
 * The message a reply quotes. It is usually in the loaded timeline; one that
 * isn't (older than the loaded history) is fetched on its own, and fetched
 * again whenever it is edited or deleted.
 */
function useReplyParent(
  parentId: string,
  loaded: MatrixChatMessage | undefined,
): ParentState {
  const { client, activeRoomId } = useMatrixClient();
  const [fetched, setFetched] = useState<ParentState>({ status: 'loading' });
  const [version, setVersion] = useState(0);
  const watchIdsRef = useRef(new Set<string>([parentId]));

  useEffect(() => {
    if (loaded || !client || !activeRoomId) return;
    let cancelled = false;
    resolveParent(client, activeRoomId, parentId)
      .then(({ message, watchIds }) => {
        if (cancelled) return;
        watchIdsRef.current = new Set([parentId, ...watchIds]);
        setFetched(
          message ? { status: 'loaded', message } : { status: 'unavailable' },
        );
      })
      .catch(() => {
        if (!cancelled) setFetched({ status: 'unavailable' });
      });
    return () => {
      cancelled = true;
    };
  }, [client, activeRoomId, parentId, loaded, version]);

  useEffect(() => {
    if (loaded || !client || !activeRoomId) return;
    const refresh = () => setVersion((v) => v + 1);
    const onEvent = (event: MatrixEvent) => {
      if (event.getRoomId?.() !== activeRoomId) return;
      const editedId = getReplacedEventId(event);
      if (editedId && watchIdsRef.current.has(editedId)) refresh();
    };
    const onRedaction = (redaction: MatrixEvent, room: Room) => {
      if (room?.roomId !== activeRoomId) return;
      const redactedId =
        redaction?.event?.redacts ?? redaction?.getAssociatedId?.();
      if (redactedId && watchIdsRef.current.has(redactedId)) refresh();
    };
    client.on('Room.timeline' as any, onEvent);
    client.on('Event.decrypted' as any, onEvent);
    client.on('Room.redaction' as any, onRedaction);
    return () => {
      client.removeListener('Room.timeline' as any, onEvent);
      client.removeListener('Event.decrypted' as any, onEvent);
      client.removeListener('Room.redaction' as any, onRedaction);
    };
  }, [client, activeRoomId, loaded]);

  if (loaded) return { status: 'loaded', message: loaded };
  if (!client) return { status: 'unavailable' };
  return fetched;
}

/** Scroll the conversation to a message and flash it. */
function jumpToMessage(from: HTMLElement, eventId: string): boolean {
  const target = from
    .closest('.tc-stream')
    ?.querySelector<HTMLElement>(`[data-event-id="${CSS.escape(eventId)}"]`);
  if (!target) return false;
  target.scrollIntoView({ block: 'center', behavior: 'smooth' });
  target.classList.add('is-highlighted');
  setTimeout(() => target.classList.remove('is-highlighted'), HIGHLIGHT_MS);
  return true;
}

interface MatrixReplyQuoteProps {
  parentId: string;
  /** The quoted message when it is in the loaded timeline. */
  parent?: MatrixChatMessage;
  memberNames?: Map<string, string>;
  currentUserId?: string | null;
}

/** The quote of the replied-to message at the top of a reply's bubble. */
export const MatrixReplyQuote: FC<MatrixReplyQuoteProps> = ({
  parentId,
  parent,
  memberNames,
  currentUserId,
}) => {
  const state = useReplyParent(parentId, parent);

  if (state.status !== 'loaded') {
    return (
      <div className="tc-reply-quote is-unavailable">
        <span className="tc-reply-quote__text">
          {state.status === 'loading'
            ? translate('Loading original message...')
            : translate('Original message is unavailable')}
        </span>
      </div>
    );
  }

  const { message } = state;
  const sender =
    message.sender === currentUserId
      ? translate('You')
      : getSenderName(message, memberNames ?? new Map());
  const content = (
    <>
      <span className="tc-reply-quote__sender">{sender}</span>
      <span className="tc-reply-quote__text">{getMessagePreview(message)}</span>
    </>
  );

  // Only a message in the loaded timeline has a row to scroll to.
  if (!parent) {
    return <div className="tc-reply-quote">{content}</div>;
  }
  return (
    <button
      type="button"
      className="tc-reply-quote"
      aria-label={translate('Go to the message from {sender}', { sender })}
      onClick={(e: MouseEvent<HTMLButtonElement>) =>
        jumpToMessage(e.currentTarget, parentId)
      }
    >
      {content}
    </button>
  );
};

interface MatrixComposerReplyBarProps {
  message: MatrixChatMessage;
  /** Who is replied to, or null for the user's own message. */
  senderName: string | null;
  onCancel: () => void;
}

/** "Replying to …" above the composer while a reply is being written. */
export const MatrixComposerReplyBar: FC<MatrixComposerReplyBarProps> = ({
  message,
  senderName,
  onCancel,
}) => (
  <div className="tc-composer-reply">
    <div className="tc-composer-reply__body">
      <span className="tc-composer-reply__title">
        {senderName === null
          ? translate('Replying to yourself')
          : translate('Replying to {name}', { name: senderName })}
      </span>
      <span className="tc-composer-reply__text">
        {getMessagePreview(message)}
      </span>
    </div>
    <BaseButton
      variant="text-secondary"
      size="sm"
      onClick={onCancel}
      aria-label={translate('Cancel reply')}
      tooltip={translate('Cancel reply')}
      iconNode={<XIcon weight="bold" />}
    />
  </div>
);
