import Markdown, { RuleType } from 'markdown-to-jsx';
import { FC } from 'react';

import { UIBlockProps } from '@/ai-assistant/lib/types';

export const MarkdownBlock: FC<UIBlockProps> = ({ block }) => {
  return (
    <div className="aui-md">
      <Markdown
        options={{
          // Open every markdown link in a new tab — covers both inline body links and the table-cell CTA
          overrides: {
            a: {
              props: {
                target: '_blank',
                rel: 'noopener noreferrer',
              },
            },
          },
          // Disable code block rendering in a text block.
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
