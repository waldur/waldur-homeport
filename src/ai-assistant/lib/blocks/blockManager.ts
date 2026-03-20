import { ChatResponse } from 'waldur-js-client';

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
 *
 * TOOL CALL FLOW:
 * 1. Server sends { k: 'load', t: 'tool' } → We create a 'tool' loading block (inline spinner)
 * 2. Server sends { k: 'table', h: [...], r: [...] } → Early guard strips the tool loading block,
 *    then the normal handler creates the result block as usual
 */
export function updateBlocks(
  existingBlocks: UIBlock[],
  part: ChatResponse,
): UIBlock[] {
  // Strip tool loading block before any handler runs — the next event
  // carries the actual result and will create the real block via normal paths.
  if (part.k !== 'load') {
    const lastBlock = existingBlocks[existingBlocks.length - 1];
    if (lastBlock?.key === 'tool' && lastBlock.status === 'loading') {
      existingBlocks = existingBlocks.slice(0, -1);
    }
  }

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
          headers: (part.h as string[]) ?? lastBlock.headers,
          rows: (part.r as string[][]) ?? lastBlock.rows,
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
        headers: part.h as string[],
        rows: part.r as string[][],
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
