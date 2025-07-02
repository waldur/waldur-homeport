import Markdown, { RuleType } from 'markdown-to-jsx';
import { FunctionComponent, PropsWithChildren } from 'react';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { formatTemplate } from '@waldur/i18n/translate';

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

export const CodePreview = ({ template, context }) => (
  <Markdown
    options={{
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
    {formatTemplate(template, context)}
  </Markdown>
);
