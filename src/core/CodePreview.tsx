import Markdown, { RuleType } from 'markdown-to-jsx';

import { CodeBlock } from '@/core/CodeBlock';
import { formatTemplate } from '@/i18n/translate';

import './SafeMarkdown.scss';

export const CodePreview = ({ template = '', context }) => {
  const formattedTemplate = formatTemplate(template, context);

  // A one-line fence (```ssh user@host```) is a code block too: put its
  // content on lines of its own, which the markdown parser needs. A one-line
  // fence has no language tag, so its first word is part of the command.
  const normalizedTemplate = formattedTemplate.replace(
    /```([^`\n]+)```/g,
    (_match, content) => '\n```\n' + content.trim() + '\n```\n',
  );

  return (
    <Markdown
      // rich-text: inline `code` gets the shared look (src/tailwind.css).
      className="md-content rich-text md-small-titles"
      options={{
        overrides: {
          br: {
            component: 'br',
          },
        },
        renderRule(next, node, _, state) {
          if (node.type === RuleType.codeBlock) {
            return (
              <CodeBlock key={state.key} prompt copyable>
                {/* The parser keeps the fence's last line break; copied,
                    it would run the pasted command at once. */}
                {String.raw`${node.text}`.replace(/\n$/, '')}
              </CodeBlock>
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
