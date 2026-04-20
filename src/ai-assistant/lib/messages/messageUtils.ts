import { ThreadMessageLike } from '@assistant-ui/react';
import { Message } from 'waldur-js-client';

import {
  UIBlock,
  BlockBasedMetadata,
  BlockHistoryEntry,
  MessageHandlerDependencies,
} from '@waldur/ai-assistant/lib/types';

/**
 * Maximum number of block history entries to retain per message.
 * Limits memory usage while providing sufficient edit history for user navigation.
 * 10 versions balances UX (enough history) with memory constraints (prevents unbounded growth).
 */
const MAX_BLOCK_HISTORY_ENTRIES = 10;

export const addPreviousBlocks = (
  metadata: ThreadMessageLike['metadata'] | undefined,
  previousBlocks: UIBlock[],
): ThreadMessageLike['metadata'] => {
  // Don't save empty block arrays
  if (!previousBlocks || previousBlocks.length === 0) {
    return metadata;
  }

  const custom = metadata?.custom ?? {};
  const existingHistory = (custom.blockHistory as BlockHistoryEntry[]) ?? [];
  const previousWarning = (custom as BlockBasedMetadata).warning;

  const newEntry: BlockHistoryEntry = {
    blocks: previousBlocks,
    createdAt: new Date().toISOString(),
    ...(previousWarning ? { warning: previousWarning } : {}),
  };

  // Limit to MAX_BLOCK_HISTORY_ENTRIES entries, removing oldest if needed
  const updatedHistory = [...existingHistory, newEntry].slice(
    -MAX_BLOCK_HISTORY_ENTRIES,
  );

  return {
    ...metadata,
    custom: {
      ...custom,
      blockHistory: updatedHistory,
    },
  };
};

/**
 * Required by assistant-ui's external store adapter.
 * Currently, a pass-through function, but kept for interface compliance.
 */
export const convertMessage = (message: ThreadMessageLike) => {
  return message;
};

export function extractTextFromMessageContent(
  content: ThreadMessageLike['content'],
): string {
  if (!Array.isArray(content) || content.length === 0) return '';

  const first = content[0];

  if (
    typeof first === 'object' &&
    first &&
    first.type === 'text' &&
    typeof first.text === 'string'
  ) {
    return first.text;
  }

  return '';
}

/**
 * Block-specific content extractors.
 */
const blockExtractors: Record<string, (block: UIBlock) => string> = {
  markdown: (block) => block.content,
  code: (block) => block.content,
  mermaid: (block) => block.content,
  vm_order: (block) => {
    const lines: string[] = [];

    // Add intro message if available
    if (block.content) {
      lines.push(block.content);
      lines.push('');
    }

    // Add status-specific header
    if (block.order_status === 'success' || block.order_status === 'error') {
      lines.push(
        block.order_status === 'success'
          ? 'VM Order Created Successfully'
          : 'VM Creation Failed',
      );
      lines.push('');
    }

    // Add VM details
    if (block.name) lines.push(`VM Name: ${block.name}`);
    if (block.project) lines.push(`Project: ${block.project}`);
    if (block.flavor) lines.push(`Flavor: ${block.flavor}`);
    if (block.image) lines.push(`Image: ${block.image}`);
    if (block.order_id) lines.push(`Order ID: ${block.order_id}`);

    // Add error message if present
    if (block.error) {
      lines.push('');
      lines.push(`Error: ${block.error}`);
    }

    // Add success message if present
    if (block.message && block.order_status === 'success') {
      lines.push('');
      lines.push(block.message);
    }

    return lines.join('\n');
  },
};

/**
 * The backend persists tool blocks as self-contained records with the result
 * nested inside (`{key: 'tool', tool: {...}, result: {key: 'table', ...}}`),
 * but the live-streaming path emits results as siblings of the tool marker
 * and BlockRenderer iterates a flat array. Unwrap each `tool` block by
 * emitting the tool block without its nested payload followed by the result
 * as a sibling.
 */
const flattenToolBlocks = (
  rawBlocks: readonly unknown[] | null | undefined,
): UIBlock[] => {
  if (!rawBlocks?.length) return [];
  const raw = rawBlocks as Array<UIBlock & { result?: UIBlock }>;
  return raw.flatMap((block) => {
    if (block.key === 'tool' && block.result) {
      const { result, ...toolOnly } = block;
      return [toolOnly, result];
    }
    return [block];
  });
};

/**
 * Extract flattened UI blocks from a backend Message. The SDK types
 * `Message.blocks` loosely (id/key/status + additionalProperties) because
 * JSON fields can't be narrowed at schema-gen time, so we cast here.
 */
export const messageBlocks = (message: Message): UIBlock[] =>
  flattenToolBlocks(message.blocks as unknown as readonly unknown[]);

export function extractTextFromBlocks(blocks: UIBlock[]): string {
  if (!blocks || blocks.length === 0) return '';

  return blocks
    .map((block) => {
      const extractor = blockExtractors[block.key] ?? ((b) => b.content);
      return extractor(block);
    })
    .join('\n\n');
}

const patchMessageMetadata = (
  setMessages: MessageHandlerDependencies['setMessages'],
  predicate: (m: ThreadMessageLike) => boolean,
  patch: Record<string, unknown>,
) => {
  setMessages((prev) =>
    prev.map((m) =>
      predicate(m)
        ? {
            ...m,
            metadata: {
              ...m.metadata,
              custom: { ...m.metadata?.custom, ...patch },
            },
          }
        : m,
    ),
  );
};

export const setBackendUuid = (
  setMessages: MessageHandlerDependencies['setMessages'],
  messageId: string,
  backendUuid: string,
) =>
  patchMessageMetadata(setMessages, (m) => m.id === messageId, { backendUuid });
