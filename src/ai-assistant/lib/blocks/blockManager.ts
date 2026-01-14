import { UIBlock } from '@waldur/ai-assistant/lib/types';

/**
 * updateBlocks - Manages incremental block state updates during streaming
 *
 * This function implements a state machine for building blocks from stream chunks.
 * It's called on every chunk received from the streaming API.
 *
 * STREAMING FLOW:
 * 1. Server sends { k: 'load', t: 'mermaid' } → We create mermaid block with empty content & loading status
 * 2. Server sends { k: 'mermaid', c: 'graph TD...' } → Transition to streaming, set content
 * 3. Server sends { k: 'mermaid', c: 'A --> B' } → Append to existing mermaid block
 * 4. Server sends { k: 'markdown', c: 'Hello' } → New block type, create new block
 */
export function updateBlocks(
  existingBlocks: UIBlock[],
  part: {
    k?: string;
    c?: string;
    t?: string;
    m?: Record<string, unknown>;
    e?: string;
  },
): UIBlock[] {
  // Handle 'load' key: create empty block with loading status
  if (part.k === 'load' && part.t) {
    return [
      ...existingBlocks,
      {
        id: crypto.randomUUID(),
        key: part.t, // Use the component key directly (e.g., 'mermaid', 'code')
        content: '',
        tag: part.t,
        status: 'loading',
      },
    ];
  }

  // Handle content key
  if (part.k && part.c !== undefined) {
    const lastBlock = existingBlocks[existingBlocks.length - 1];

    // Transition from loading to streaming
    if (lastBlock?.key === part.k && lastBlock.status === 'loading') {
      return [
        ...existingBlocks.slice(0, -1),
        {
          ...lastBlock,
          content: part.c,
          tag: part.t,
          status: 'streaming',
        },
      ];
    }

    // Append to existing block of same type
    if (lastBlock?.key === part.k && lastBlock.status === 'streaming') {
      return [
        ...existingBlocks.slice(0, -1),
        {
          ...lastBlock,
          content: lastBlock.content + part.c,
        },
      ];
    }

    // Create new block
    // Triggered when switching to a different content type
    return [
      ...existingBlocks,
      {
        id: crypto.randomUUID(),
        key: part.k,
        content: part.c,
        tag: part.t,
        status: 'streaming',
      },
    ];
  }

  // No update needed - return existing blocks unchanged
  return existingBlocks;
}

export function markBlocksComplete(blocks: UIBlock[]): UIBlock[] {
  return blocks.map((block) => ({
    ...block,
    status: 'complete' as const,
  }));
}
