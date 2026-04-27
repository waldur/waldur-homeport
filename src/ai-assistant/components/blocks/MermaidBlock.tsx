import { FC } from 'react';

import { MermaidDiagram } from '@/ai-assistant/components/MermaidDiagram';
import { CodeHeader } from '@/ai-assistant/components/shared/CodeHeader';
import { UIBlockProps } from '@/ai-assistant/lib/types';

export const MermaidBlock: FC<UIBlockProps> = ({ block }) => {
  const isComplete = block.status === 'complete';
  const code = block.content;

  return (
    <div className="aui-code-block-root">
      <CodeHeader language="mermaid" code={code} showCopyButton={isComplete} />
      <MermaidDiagram code={code} />
    </div>
  );
};
