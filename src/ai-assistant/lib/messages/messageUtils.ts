import { ThreadMessageLike } from '@assistant-ui/react';

import { UIBlock, BlockHistoryEntry } from '@waldur/ai-assistant/lib/types';

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

export const addContext = (
  userInput: string,
  pastMessages: readonly ThreadMessageLike[],
): string => {
  const contextMessages = pastMessages.slice(-50);
  let context =
    'This is the system prompt: You are a highly knowledgeable and helpful support assistant for ' +
    'Waldur. Your primary goal is to provide clear, accurate, and friendly assistance to users. ' +
    'Always respond in a professional and polite tone, breaking down complex instructions into simple, ' +
    'easy-to-follow steps.\n';
  context += 'This is the conversation history:\n';
  for (const message of contextMessages) {
    const blocks = (message.metadata?.custom as { blocks?: UIBlock[] })?.blocks;
    const contentText = blocks
      ? extractTextFromBlocks(blocks) // Assistant message with blocks
      : extractTextFromMessageContent(message.content); // User message
    context += `${message.role}: ${contentText}\n`;
  }

  context += `\nThis is the user prompt: ${userInput}\n`;
  return context;
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

export function extractTextFromBlocks(blocks: UIBlock[]): string {
  if (!blocks || blocks.length === 0) return '';
  return blocks.map((block) => block.content).join('\n\n');
}
