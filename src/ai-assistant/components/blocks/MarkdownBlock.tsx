import Markdown, { RuleType } from 'markdown-to-jsx';
import { FC } from 'react';

import { UIBlockProps } from '@waldur/ai-assistant/lib/types';

export const MarkdownBlock: FC<UIBlockProps> = ({ block }) => {
  return (
    <div className="aui-md">
      <Markdown
        // Disable code block rendering in a text block.
        options={{
          renderRule: (next, node, _, state) => {
            if (node.type === RuleType.codeBlock) {
              return <p key={state.key}>{String.raw`${node.text}`}</p>;
            }

            return next();
          },
        }}
      >
        {block.content}
      </Markdown>
    </div>
  );
};
