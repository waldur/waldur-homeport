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
 * 2. Server sends the result event → Early guard strips the tool loading block,
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

  // Handle vm_order data with structured fields
  // Backend sends: {"k":"vm_order","order_id":"...","name":"...","status":"...",...}
  if (part.k === 'vm_order') {
    const lastBlock = existingBlocks[existingBlocks.length - 1];

    // Transition from loading to streaming or update existing vm_order
    if (lastBlock?.key === 'vm_order') {
      return [
        ...existingBlocks.slice(0, -1),
        {
          ...lastBlock,
          content: part.content ?? lastBlock.content ?? '',
          order_id: part.order_id ?? lastBlock.order_id,
          name: part.name ?? lastBlock.name,
          flavor: part.flavor ?? lastBlock.flavor,
          image: part.image ?? lastBlock.image,
          project: part.project ?? lastBlock.project,
          organization: part.organization ?? lastBlock.organization,
          project_uuid: part.project_uuid ?? lastBlock.project_uuid,
          order_status: part.status ?? lastBlock.order_status,
          message: part.message ?? lastBlock.message,
          error: part.error ?? lastBlock.error,
          flavors: (part.flavors as UIBlock['flavors']) ?? lastBlock.flavors,
          images: (part.images as UIBlock['images']) ?? lastBlock.images,
          projects:
            (part.projects as UIBlock['projects']) ?? lastBlock.projects,
          offerings:
            (part.offerings as UIBlock['offerings']) ?? lastBlock.offerings,
          status: 'streaming',
        },
      ];
    }

    // Create new vm_order block
    return [
      ...existingBlocks,
      {
        id: randomUUID(),
        key: 'vm_order',
        content: part.content,
        order_id: part.order_id,
        name: part.name,
        flavor: part.flavor,
        image: part.image,
        project: part.project,
        organization: part.organization,
        project_uuid: part.project_uuid,
        order_status: part.status,
        message: part.message,
        error: part.error,
        flavors: part.flavors as UIBlock['flavors'],
        images: part.images as UIBlock['images'],
        projects: part.projects as UIBlock['projects'],
        offerings: part.offerings as UIBlock['offerings'],
        status: 'streaming',
      },
    ];
  }

  // Handle resource_list data with structured fields
  if (part.k === 'resource_list') {
    const lastBlock = existingBlocks[existingBlocks.length - 1];

    if (lastBlock?.key === 'resource_list') {
      return [
        ...existingBlocks.slice(0, -1),
        {
          ...lastBlock,
          project_uuid: part.project_uuid ?? lastBlock.project_uuid,
          customer_uuid: part.customer_uuid ?? lastBlock.customer_uuid,
          category_uuid: part.category_uuid ?? lastBlock.category_uuid,
          state: (part.state as string[]) ?? lastBlock.state,
          status: 'streaming',
        },
      ];
    }

    return [
      ...existingBlocks,
      {
        id: randomUUID(),
        key: 'resource_list',
        content: '',
        project_uuid: part.project_uuid,
        customer_uuid: part.customer_uuid,
        category_uuid: part.category_uuid,
        state: part.state as string[],
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
