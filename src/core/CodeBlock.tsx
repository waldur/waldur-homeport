import { FC, Fragment } from 'react';

import { cn } from 'waldur-ui';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';

interface CodeBlockProps {
  /**
   * The commands, one per line. A line ending in `\` continues on the next,
   * as in a shell. The copy button copies this text as it is.
   */
  children: string;
  /** A `$` before each command, and none before its continuation lines. */
  prompt?: boolean;
  /** A copy button beside the first line. */
  copyable?: boolean;
}

/** Each line, and whether it continues the command above (after a `\`). */
const splitShellLines = (text: string) =>
  text.split('\n').map((line, index, lines) => ({
    line,
    continuation: index > 0 && /\\\s*$/.test(lines[index - 1]),
  }));

/**
 * Shell commands on a tinted strip, as a Getting started template shows
 * them. Each command gets a muted `$`, which a reader's selection leaves out;
 * a long line wraps instead of scrolling, its wrapped rows hanging under the
 * first with a ↳ in the indent (`code-wrap-marker`, src/tailwind.css), so a
 * wrap never reads as a new line. For one value or one line of output, use
 * `CodeLine`.
 */
export const CodeBlock: FC<CodeBlockProps> = ({
  children,
  prompt,
  copyable,
}) => (
  <div className="block">
    <pre className="flex items-start bg-tertiary p-0 mb-0 text-sm">
      <span
        className={cn(
          'grid grow min-w-0 gap-x-2 py-3 px-2.5',
          prompt ? 'grid-cols-[auto_minmax(0,1fr)]' : 'grid-cols-1',
        )}
      >
        {splitShellLines(children).map(({ line, continuation }, index) => (
          <Fragment key={index}>
            {prompt && (
              <span aria-hidden="true" className="select-none text-quaternary">
                {continuation ? '' : '$'}
              </span>
            )}
            <span className="code-wrap-marker whitespace-pre-wrap wrap-anywhere ps-4 -indent-4">
              {/* A space keeps an empty line's height. */}
              {line || ' '}
            </span>
          </Fragment>
        ))}
      </span>
      {copyable && (
        // Level with the first line: mt-2 centres the 28px button on the
        // line's 20px.
        <span className="self-start mt-2 ms-1 px-2.5">
          <CopyToClipboardButton value={children} />
        </span>
      )}
    </pre>
  </div>
);
