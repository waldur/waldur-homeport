import { forwardRef, HTMLAttributes, ReactNode } from 'react';

import { cn } from '../cn';

export type EmptyStateSize = 'sm' | 'md';

export interface EmptyStateProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title'
> {
  /** A short heading above the message, for a state that needs one. */
  title?: ReactNode;
  /** What is missing, in a sentence: "No presets match the search." */
  message: ReactNode;
  /** A next step, usually a small button or a link. */
  action?: ReactNode;
  /**
   * `sm`: muted text at the size of the text around it, for a line inside a
   * row, a card or a list. `md` (default): a dashed frame with the message
   * centred in it, for an empty section of a dialog or a panel.
   */
  size?: EmptyStateSize;
}

/**
 * "Nothing here" for an inline or in-dialog spot: lighter than
 * `NoResult`, which is for a whole table or page and carries an illustration.
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ title, message, action, size = 'md', className, ...props }, ref) => (
    <div
      ref={ref}
      data-size={size}
      className={cn(
        'text-quaternary',
        size === 'sm'
          ? 'text-xs leading-5'
          : 'flex flex-col items-center gap-1 rounded-lg border border-dashed border-secondary px-3 py-5 text-center',
        className,
      )}
      {...props}
    >
      {title ? <div className="font-semibold text-primary">{title}</div> : null}
      <p className="m-0">{message}</p>
      {action ? (
        <div className={size === 'sm' ? 'mt-1.5' : 'mt-2.5'}>{action}</div>
      ) : null}
    </div>
  ),
);
EmptyState.displayName = 'EmptyState';
