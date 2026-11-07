import { FC } from 'react';

import { cn } from 'waldur-ui';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';

type CodeLineVariant = 'inline' | 'dense';

interface CodeLineProps {
  /** The line shown, and what the copy button copies. */
  children: string;
  /** A `$` before the line: it is a shell command. */
  prompt?: boolean;
  /** Numbers the line, as in a command's output. */
  lineNumber?: number;
  /** A copy button after the line. */
  copyable?: boolean;
  /**
   * `inline` sizes to the value, up to 280px (a key, a username or a link in
   * a table row). `dense` drops the vertical padding, so consecutive lines
   * read as one block (a command's output).
   */
  variant?: CodeLineVariant;
}

const WRAPPER_CLASSES: Record<CodeLineVariant, string> = {
  inline: 'inline-block',
  dense: 'block',
};

const CONTENT_CLASSES: Record<CodeLineVariant, string> = {
  inline: 'py-3 px-2.5 mt-0.75 overflow-x-auto text-sm max-w-70',
  dense: '',
};

/**
 * One line of code on a tinted strip: a value to copy, or a line of output.
 * A long value scrolls inside the strip. For shell commands, which may run
 * over several lines, use `CodeBlock`.
 */
export const CodeLine: FC<CodeLineProps> = ({
  children,
  prompt,
  lineNumber,
  copyable,
  variant = 'inline',
}) => (
  <div className={WRAPPER_CLASSES[variant]}>
    <pre
      className={cn(
        'flex items-center bg-tertiary p-0 mb-0',
        variant === 'dense' && 'text-sm',
      )}
    >
      {lineNumber !== undefined && <span>{lineNumber}.</span>}
      {prompt && (
        <span className="me-1 px-2.5 border-r border-primary pointer-events-none">
          $
        </span>
      )}
      <span className={CONTENT_CLASSES[variant]}>{children}</span>
      {copyable && (
        <span className="ms-1 px-2.5 border-l border-primary">
          <CopyToClipboardButton value={children} />
        </span>
      )}
    </pre>
  </div>
);
