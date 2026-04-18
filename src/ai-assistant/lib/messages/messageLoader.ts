// @ts-nocheck
import { ThreadMessageLike } from '@assistant-ui/react';
import { chatMessagesList, Message } from 'waldur-js-client';

import { BlockBasedMetadata, BlockHistoryEntry } from '../types';

import { extractTextFromBlocks, messageBlocks } from './messageUtils';

export interface MessageWithVersions {
  current: Message;
  versions: Message[]; // ordered oldest → newest, last element = current
}

/**
 * Groups flat message list by sequence_index to reconstruct edit history.
 */
export const groupBySequenceIndex = (
  messages: Message[],
): MessageWithVersions[] => {
  const groups = new Map<number, Message[]>();
  for (const msg of messages) {
    const key = msg.sequence_index;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(msg);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a - b)
    .map(([, versions]) => {
      const sorted = versions.sort(
        (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime(),
      );
      return { current: sorted[sorted.length - 1], versions: sorted };
    });
};

const messageWarning = (message: Message): string | undefined =>
  message.warning || undefined;

/**
 * Build blockHistory from older versions of an assistant message.
 * Each prior version already carries its own blocks/warning — no conversion.
 */
const buildBlockHistory = (versions: Message[]): BlockHistoryEntry[] =>
  versions.slice(0, -1).map((version) => {
    const warning = messageWarning(version);
    return {
      blocks: messageBlocks(version),
      createdAt: version.created,
      ...(warning ? { warning } : {}),
    };
  });

/**
 * Convert a MessageWithVersions group into a ThreadMessageLike.
 */
const convertToThreadMessage = (
  group: MessageWithVersions,
): ThreadMessageLike => {
  const { current, versions } = group;
  const isAssistant = current.role === 'assistant';
  const blocks = messageBlocks(current);
  const textFallback = extractTextFromBlocks(blocks);

  if (isAssistant) {
    const blockHistory = buildBlockHistory(versions);
    const warning = messageWarning(current);

    const metadata = {
      custom: {
        blocks,
        backendUuid: current.uuid,
        ...(warning ? { warning } : {}),
        ...(blockHistory.length > 0 ? { blockHistory } : {}),
      } as BlockBasedMetadata & { backendUuid: string } & Record<
          string,
          unknown
        >,
    };

    return {
      id: current.uuid,
      role: 'assistant',
      content: [{ type: 'text', text: textFallback }],
      createdAt: new Date(current.created),
      metadata,
    };
  }

  // User message — the backend wraps user text as a single markdown block.
  return {
    id: current.uuid,
    role: 'user',
    content: [{ type: 'text', text: textFallback }],
    createdAt: new Date(current.created),
    metadata: { custom: { backendUuid: current.uuid } },
  };
};

/**
 * Fetch messages for a thread from the backend and convert to ThreadMessageLike[].
 * Returns empty array if the fetch fails or thread has no messages.
 */
export const fetchAndConvertMessages = async (
  threadUuid: string,
): Promise<ThreadMessageLike[]> => {
  const response = await chatMessagesList({
    query: { thread: threadUuid, include_history: true },
  });

  if (response.error || !response.data?.length) {
    return [];
  }

  const grouped = groupBySequenceIndex(response.data);
  return grouped.map(convertToThreadMessage);
};
