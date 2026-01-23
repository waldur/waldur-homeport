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
      // Check table-specific fields
      prev.block.headers === next.block.headers &&
      prev.block.rows === next.block.rows &&
      prev.block.totalCount === next.block.totalCount
    );
  },
);

MemoizedBlock.displayName = 'MemoizedBlock';

export const BlockRenderer: FC<BlockRendererProps> = ({ blocks }) => {
  // Filter out empty blocks (memoized to prevent recalculation)
  // Allow loading blocks through even with empty content - they show their own loading UI
  // Allow table blocks with structured data (headers/rows) even if content is empty
  const validBlocks = useMemo(
    () =>
      blocks.filter(
        (block) =>
          block.content ||
          block.status === 'loading' ||
          (block.key === 'table' && (block.headers || block.rows)),
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
