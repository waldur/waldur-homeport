import { FC, memo, useMemo } from 'react';

import { uiRegistry } from '@waldur/ai-assistant/lib/registry/uiRegistry';
import { UIBlock, UIBlockProps } from '@waldur/ai-assistant/lib/types';

interface BlockRendererProps {
  blocks: UIBlock[];
}

/**
 * Prevents unnecessary re-renders of unchanged blocks.
 * Only re-renders when block content, status, or key changes.
 * This prevents all blocks from re-rendering when only the last block is being updated during streaming.
 */
const MemoizedBlock: FC<UIBlockProps> = memo(
  ({ block }) => {
    const Component = uiRegistry.getComponent(block.key);
    return <Component block={block} />;
  },
  (prev, next) => {
    // Only re-render if these values change
    return (
      prev.block.id === next.block.id &&
      prev.block.content === next.block.content &&
      prev.block.status === next.block.status &&
      prev.block.key === next.block.key &&
      prev.block.tag === next.block.tag &&
      // Check vm_order-specific fields
      prev.block.order_id === next.block.order_id &&
      prev.block.name === next.block.name &&
      prev.block.flavor === next.block.flavor &&
      prev.block.image === next.block.image &&
      prev.block.project === next.block.project &&
      prev.block.organization === next.block.organization &&
      prev.block.project_uuid === next.block.project_uuid &&
      prev.block.order_status === next.block.order_status &&
      // Check homeport_nav fields
      prev.block.nav_links === next.block.nav_links &&
      prev.block.message === next.block.message &&
      prev.block.error === next.block.error &&
      // Check resource_list-specific fields
      prev.block.customer_uuid === next.block.customer_uuid &&
      prev.block.category_uuid === next.block.category_uuid &&
      prev.block.state?.join(',') === next.block.state?.join(',')
    );
  },
);

MemoizedBlock.displayName = 'MemoizedBlock';

export const BlockRenderer: FC<BlockRendererProps> = ({ blocks }) => {
  // Filter out empty blocks (memoized to prevent recalculation)
  // Allow loading blocks through even with empty content - they show their own loading UI
  // Allow vm_order blocks with structured data even if content is empty
  const validBlocks = useMemo(
    () =>
      blocks.filter(
        (block) =>
          block.content ||
          block.status === 'loading' ||
          (block.key === 'vm_order' &&
            (block.order_id ||
              block.name ||
              block.error ||
              block.order_status ||
              block.status === 'streaming')) ||
          block.key === 'resource_list',
      ),
    [blocks],
  );

  return (
    <>
      {validBlocks.map((block) => (
        <MemoizedBlock key={block.id} block={block} />
      ))}
    </>
  );
};
