import { FC } from 'react';

import { MarkdownBlock } from '@/ai-assistant/components/blocks/MarkdownBlock';
import { UIBlockProps } from '@/ai-assistant/lib/types';

// What the model said it is about to do before a tool call. Muted, so it reads
// as part of the process rather than the answer.
export const NarrationBlock: FC<UIBlockProps> = ({ block }) => (
  <div className="text-sm italic">
    <MarkdownBlock block={{ ...block, key: 'markdown', status: 'complete' }} />
  </div>
);
