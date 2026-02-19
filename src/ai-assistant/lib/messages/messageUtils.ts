import { ThreadMessageLike } from '@assistant-ui/react';

import {
  UIBlock,
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

  const newEntry: BlockHistoryEntry = {
    blocks: previousBlocks,
    createdAt: new Date().toISOString(),
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
  table: (block) => {
    if (!block.headers || !block.rows) return block.content;

    // Format as Markdown table
    const headers = block.headers.join(' | ');
    const separator = block.headers.map(() => '---').join(' | ');
    const rows = block.rows.map((row) => row.join(' | ')).join('\n');

    return `${headers}\n${separator}\n${rows}`;
  },
};

export function extractTextFromBlocks(blocks: UIBlock[]): string {
  if (!blocks || blocks.length === 0) return '';

  return blocks
    .map((block) => {
      const extractor = blockExtractors[block.key] ?? ((b) => b.content);
      return extractor(block);
    })
    .join('\n\n');
}

export const setBackendUuid = (
  setMessages: MessageHandlerDependencies['setMessages'],
  messageId: string,
  backendUuid: string,
) => {
  setMessages((prev) =>
    prev.map((m) =>
      m.id === messageId
        ? {
            ...m,
            metadata: {
              ...m.metadata,
              custom: { ...m.metadata?.custom, backendUuid },
            },
          }
        : m,
    ),
  );
};
