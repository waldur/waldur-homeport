import { FC } from 'react';

import { SkeletonLoader } from '@waldur/ai-assistant/components/shared/SkeletonLoader';
import { UIBlockProps } from '@waldur/ai-assistant/lib/types';

export const ToolLoadingBlock: FC<UIBlockProps> = ({ block }) => {
  if (block.status !== 'loading') return null;

  return <SkeletonLoader />;
};
