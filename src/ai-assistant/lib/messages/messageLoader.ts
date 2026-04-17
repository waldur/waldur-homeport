// @ts-nocheck
import { ThreadMessageLike } from '@assistant-ui/react';
import { chatMessagesList, Message } from 'waldur-js-client';

import { randomUUID } from '@waldur/core/utils';

import { BlockBasedMetadata, BlockHistoryEntry, UIBlock } from '../types';

interface MessageWithVersions {
  current: Message;
  versions: Message[];
}

/**
 * Groups flat message list by sequence_index to reconstruct edit history.
 * Same logic as SupportAIAssistantLogsExpandableRow.
 */
const groupBySequenceIndex = (messages: Message[]): MessageWithVersions[] => {
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

/**
 * Convert a stored tool result block (from tool_calls[].result) into a UIBlock.
 */
const convertToolResultToBlock = (
  result: Record<string, unknown>,
): UIBlock | null => {
  const key = result.k as string;
  if (!key) return null;

  if (key === 'vm_order') {
    return {
      id: randomUUID(),
      key: 'vm_order',
      content: (result.content as string) ?? '',
      order_id: result.order_id as string,
      name: result.name as string,
      flavor: result.flavor as string,
      image: result.image as string,
      project: result.project as string,
      organization: result.organization as string,
      project_uuid: result.project_uuid as string,
      order_status: result.status as string,
      message: result.message as string,
      error: result.error as string,
      flavors: result.flavors as UIBlock['flavors'],
      images: result.images as UIBlock['images'],
      projects: result.projects as UIBlock['projects'],
      offerings: result.offerings as UIBlock['offerings'],
      status: 'complete',
    };
  }

  if (key === 'resource_list') {
    return {
      id: randomUUID(),
      key: 'resource_list',
      content: '',
      project_uuid: result.project_uuid as string,
      customer_uuid: result.customer_uuid as string,
      category_uuid: result.category_uuid as string,
      state: result.state as string[],
      status: 'complete',
    };
  }

  // Generic content block (markdown, code, mermaid, etc.)
  if (result.c !== undefined) {
    return {
      id: randomUUID(),
      key,
      content: result.c as string,
      tag: result.t as string,
      status: 'complete',
    };
  }

  return null;
};

/**
 * Convert a backend Message (assistant role) into UIBlock[].
 * - If tool_calls exist, prepend a tool_used pill block
 * - Content becomes a markdown block
 * - Tool result blocks (tables, vm_order, etc.) are appended at the end
 */
const convertAssistantToBlocks = (message: Message): UIBlock[] => {
  const blocks: UIBlock[] = [];
  const toolCalls = message.tool_calls as
    | Array<Record<string, unknown>>
    | undefined;

  if (message.content) {
    blocks.push({
      id: randomUUID(),
      key: 'markdown',
      content: message.content,
      status: 'complete',
    });
  }

  // Reconstruct tool result blocks (tables, vm_order, etc.)
  if (toolCalls) {
    for (const call of toolCalls) {
      const result = call.result as Record<string, unknown> | undefined;
      if (!result) continue;
      const block = convertToolResultToBlock(result);
      if (block) blocks.push(block);
    }
  }

  return blocks;
};

/**
 * Build blockHistory from older versions of an assistant message.
 */
const buildBlockHistory = (versions: Message[]): BlockHistoryEntry[] => {
  return versions.slice(0, -1).map((version) => ({
    blocks: convertAssistantToBlocks(version),
    createdAt: version.created,
  }));
};

/**
 * Convert a MessageWithVersions group into a ThreadMessageLike.
 */
const convertToThreadMessage = (
  group: MessageWithVersions,
): ThreadMessageLike => {
  const { current, versions } = group;
  const isAssistant = current.role === 'assistant';

  if (isAssistant) {
    const blocks = convertAssistantToBlocks(current);
    const blockHistory = buildBlockHistory(versions);

    const metadata = {
      custom: {
        blocks,
        backendUuid: current.uuid,
        ...(blockHistory.length > 0 ? { blockHistory } : {}),
      } as BlockBasedMetadata & { backendUuid: string } & Record<
          string,
          unknown
        >,
    };

    return {
      id: current.uuid,
      role: 'assistant',
      content: [{ type: 'text', text: current.content || '' }],
      createdAt: new Date(current.created),
      metadata,
    };
  }

  // User message
  return {
    id: current.uuid,
    role: 'user',
    content: [{ type: 'text', text: current.content || '' }],
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
