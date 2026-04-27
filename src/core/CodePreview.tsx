import Markdown, { RuleType } from 'markdown-to-jsx';
import { FunctionComponent, PropsWithChildren } from 'react';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { formatTemplate } from '@/i18n/translate';

const CodeBlock: FunctionComponent<PropsWithChildren> = ({ children }) => (
  <div className="code-block">
    <pre>
      <div className="me-1 code-block-pre">$</div>
      <div className="code-block-content">{children}</div>
      <div className="ms-1 code-block-post">
        <CopyToClipboardButton value={children} />
      </div>
    </pre>
  </div>
);

export const CodePreview = ({ template, context }) => {
  const formattedTemplate = formatTemplate(template, context);

  const normalizedTemplate = formattedTemplate.replace(
    /```(\w+\s+)?([^`\n]+)```/g,
    (_match, _lang, content) => {
      return '\n```\n' + content.trim() + '\n```\n';
    },
  );

  return (
    <Markdown
      className="md-content"
      options={{
        overrides: {
          br: {
            component: 'br',
          },
        },
        renderRule(next, node, _, state) {
          if (node.type === RuleType.codeBlock) {
            return (
              <CodeBlock key={state.key}>{String.raw`${node.text}`}</CodeBlock>
            );
          }

          return next();
        },
      }}
    >
      {normalizedTemplate}
    </Markdown>
  );
};
