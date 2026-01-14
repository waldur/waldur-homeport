import { FC } from 'react';

import { MermaidDiagram } from '@waldur/ai-assistant/components/MermaidDiagram';
import { CodeHeader } from '@waldur/ai-assistant/components/shared/CodeHeader';
import { UIBlockProps } from '@waldur/ai-assistant/lib/types';

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
