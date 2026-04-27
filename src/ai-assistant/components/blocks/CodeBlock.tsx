import { FC } from 'react';

import { CodeHeader } from '@/ai-assistant/components/shared/CodeHeader';
import { SkeletonLoader } from '@/ai-assistant/components/shared/SkeletonLoader';
import { UIBlockProps } from '@/ai-assistant/lib/types';

export const CodeBlock: FC<UIBlockProps> = ({ block }) => {
  const isLoading = block.status === 'loading';
  const language = block.tag || 'text';
  const code = block.content;

  if (isLoading) {
    return (
      <div className="aui-code-block-root">
        <CodeHeader language={language} code="" showCopyButton={false} />
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className="aui-code-block-root">
      <CodeHeader language={language} code={code} />
      <pre className="aui-md-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
};
