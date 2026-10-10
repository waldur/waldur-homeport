import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';

import {
  buildEditContent,
  buildTextContent,
  withMentions,
} from './messageContent';
import { isEditableMsgtype } from './messageRelations';
import { redactMessageWithEdits } from './redactMessage';
import { MatrixChatMessage } from './types';
import { useMatrixClient } from './useMatrixClient';
import { useMentionCandidates } from './useMentionCandidates';
import { hasMedia } from './utils';

/** A local echo: the homeserver hasn't given it an event id yet. */
export const isPendingMessage = (message: MatrixChatMessage) =>
  message.eventId.startsWith('~');

export interface MatrixMessageActions {
  /** The message the composer is replying to. */
  replyTo: MatrixChatMessage | null;
  startReply: (message: MatrixChatMessage) => void;
  cancelReply: () => void;
  /** The message being edited in place. */
  editingEventId: string | null;
  startEdit: (message: MatrixChatMessage) => void;
  cancelEdit: () => void;
  /** Start editing the user's newest editable message; false if there is none. */
  editLastOwnMessage: () => boolean;
  /** Send an edit; resolves to whether it was sent (or nothing changed). */
  saveEdit: (message: MatrixChatMessage, text: string) => Promise<boolean>;
  deleteMessage: (message: MatrixChatMessage) => Promise<void>;
  /** Own text messages can be edited (a pending one once it is sent). */
  canEdit: (message: MatrixChatMessage) => boolean;
  /**
   * Whether the room's power levels let the user redact the message: their
   * own, unless redactions are blocked, or anyone's with the power to.
   */
  canDelete: (message: MatrixChatMessage) => boolean;
}

const noop = () => {};

// No-op default, for message rows rendered outside a conversation (tests).
const MatrixMessageActionsContext = createContext<MatrixMessageActions>({
  replyTo: null,
  startReply: noop,
  cancelReply: noop,
  editingEventId: null,
  startEdit: noop,
  cancelEdit: noop,
  editLastOwnMessage: () => false,
  saveEdit: () => Promise.resolve(false),
  deleteMessage: () => Promise.resolve(),
  canEdit: () => false,
  canDelete: () => false,
});

export const MatrixMessageActionsProvider =
  MatrixMessageActionsContext.Provider;

export const useMatrixMessageActions = () =>
  useContext(MatrixMessageActionsContext);

const errorDetail = (e: any) => e?.errcode || e?.message || 'unknown error';

/** State and handlers behind reply, edit and delete in the open conversation. */
export function useMatrixMessageActionsValue(
  messages: MatrixChatMessage[],
): MatrixMessageActions {
  const { client, activeRoomId, userId } = useMatrixClient();
  const members = useMentionCandidates();
  const { confirm } = useModal();
  const { showError } = useNotify();
  const [replyTo, setReplyTo] = useState<MatrixChatMessage | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Neither a reply nor an edit carries over to another room.
  useEffect(() => {
    setReplyTo(null);
    setEditingEventId(null);
  }, [activeRoomId]);

  // A reply target or an edited message deleted meanwhile is let go of.
  useEffect(() => {
    const deleted = new Set(
      messages.filter((m) => m.redacted).map((m) => m.eventId),
    );
    if (replyTo && deleted.has(replyTo.eventId)) setReplyTo(null);
    if (editingEventId && deleted.has(editingEventId)) setEditingEventId(null);
  }, [messages, replyTo, editingEventId]);

  const canEdit = useCallback(
    (message: MatrixChatMessage) =>
      !!userId &&
      message.sender === userId &&
      !message.redacted &&
      !hasMedia(message) &&
      isEditableMsgtype(message.type),
    [userId],
  );

  const canDelete = useCallback(
    (message: MatrixChatMessage) => {
      if (!client || !activeRoomId || !userId || message.redacted) return false;
      const room = client.getRoom(activeRoomId);
      const event = room?.findEventById(message.eventId);
      return Boolean(
        event && room.currentState.maySendRedactionForEvent(event, userId),
      );
    },
    [client, activeRoomId, userId],
  );

  const startReply = useCallback((message: MatrixChatMessage) => {
    setEditingEventId(null);
    setReplyTo(message);
  }, []);

  const startEdit = useCallback((message: MatrixChatMessage) => {
    setEditingEventId(message.eventId);
  }, []);

  const cancelReply = useCallback(() => setReplyTo(null), []);
  const cancelEdit = useCallback(() => setEditingEventId(null), []);

  const editLastOwnMessage = useCallback(() => {
    const message = [...messages]
      .reverse()
      .find((m) => canEdit(m) && !isPendingMessage(m));
    if (!message) return false;
    setEditingEventId(message.eventId);
    return true;
  }, [messages, canEdit]);

  const saveEdit = useCallback(
    async (message: MatrixChatMessage, text: string) => {
      const trimmed = text.trim();
      if (!client || !activeRoomId || !trimmed) return false;
      if (trimmed === message.body) {
        setEditingEventId(null);
        return true;
      }
      // An edited reply still mentions the replied-to sender: m.new_content
      // carries the message's full set of mentions.
      const room = client.getRoom(activeRoomId);
      const parentSender = message.replyToEventId
        ? (room?.findEventById(message.replyToEventId)?.getSender() ??
          messages.find((m) => m.eventId === message.replyToEventId)?.sender)
        : undefined;
      const replyMentions =
        parentSender && parentSender !== userId ? [parentSender] : [];
      const content = buildEditContent(
        message.eventId,
        withMentions(
          buildTextContent(trimmed, members, message.type),
          replyMentions,
        ),
        [...(message.mentionedUserIds ?? []), ...replyMentions],
      );
      try {
        // In an encrypted room the SDK encrypts the edit like any message,
        // keeping only m.relates_to in clear.
        await client.sendMessage(activeRoomId, content as any);
      } catch (e) {
        showError(
          translate('Could not edit the message ({detail}).', {
            detail: errorDetail(e),
          }),
        );
        return false;
      }
      setEditingEventId((current) =>
        current === message.eventId ? null : current,
      );
      return true;
    },
    [client, activeRoomId, userId, messages, members, showError],
  );

  const deleteMessage = useCallback(
    async (message: MatrixChatMessage) => {
      if (!client || !activeRoomId) return;
      try {
        await confirm(
          translate('Delete message?'),
          message.sender === userId
            ? translate(
                'The message is deleted for everyone in this conversation. This cannot be undone.',
              )
            : translate(
                'You are deleting another member’s message. It is deleted for everyone in this conversation. This cannot be undone.',
              ),
          {
            forDeletion: true,
            positiveButton: translate('Delete'),
            negativeButton: translate('Cancel'),
          },
        );
      } catch {
        return;
      }
      if (!userId) return;
      try {
        const { failed, incomplete } = await redactMessageWithEdits(
          client,
          activeRoomId,
          message.eventId,
          userId,
        );
        if (incomplete) {
          showError(
            translate(
              'The message was deleted, but its earlier versions could not all be found. Some may remain on the server.',
            ),
          );
        } else if (failed) {
          showError(
            translate(
              'The message was deleted, but {count} of its earlier versions could not be.',
              { count: failed },
            ),
          );
        }
      } catch (e) {
        showError(
          translate('Could not delete the message ({detail}).', {
            detail: errorDetail(e),
          }),
        );
      }
    },
    [client, activeRoomId, userId, confirm, showError],
  );

  return useMemo(
    () => ({
      replyTo,
      startReply,
      cancelReply,
      editingEventId,
      startEdit,
      cancelEdit,
      editLastOwnMessage,
      saveEdit,
      deleteMessage,
      canEdit,
      canDelete,
    }),
    [
      replyTo,
      startReply,
      cancelReply,
      editingEventId,
      startEdit,
      cancelEdit,
      editLastOwnMessage,
      saveEdit,
      deleteMessage,
      canEdit,
      canDelete,
    ],
  );
}
