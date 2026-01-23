import { UIBlock } from '@waldur/ai-assistant/lib/types';
import { randomUUID } from '@waldur/core/utils';

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
    k?: string; // Component key
    c?: string; // Content chunk
    t?: string; // Component tag
    m?: Record<string, unknown>; // Additional metadata
    e?: string; // Error message
    h?: string[]; // Table headers
    r?: string[][]; // Table rows
    n?: number; // Total count
  },
): UIBlock[] {
  // Handle 'load' key: create empty block with loading status
  if (part.k === 'load' && part.t) {
    return [
      ...existingBlocks,
      {
        id: randomUUID(),
        key: part.t, // Use the component key directly (e.g., 'mermaid', 'code')
        content: '',
        tag: part.t,
        status: 'loading',
      },
    ];
  }

  // Handle table data with structured fields (h, r, n)
  if (part.k === 'table' && (part.h || part.r || part.n !== undefined)) {
    const lastBlock = existingBlocks[existingBlocks.length - 1];

    // Transition from loading to streaming or update existing table
    if (lastBlock?.key === 'table') {
      return [
        ...existingBlocks.slice(0, -1),
        {
          ...lastBlock,
          content: part.c ?? lastBlock.content ?? '',
          headers: part.h ?? lastBlock.headers,
          rows: part.r ?? lastBlock.rows,
          totalCount: part.n ?? lastBlock.totalCount,
          status: 'streaming',
        },
      ];
    }

    // Create new table block (shouldn't happen if load event was sent first, but handle it)
    return [
      ...existingBlocks,
      {
        id: randomUUID(),
        key: 'table',
        content: part.c ?? '',
        headers: part.h,
        rows: part.r,
        totalCount: part.n,
        status: 'streaming',
      },
    ];
  }

  // Handle content key (for non-table blocks or markdown fallback)
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
        id: randomUUID(),
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
