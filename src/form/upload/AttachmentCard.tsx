import { ComponentProps, FC, ReactNode } from 'react';

import { cn } from 'waldur-ui';

interface AttachmentCardProps extends Omit<ComponentProps<'div'>, 'title'> {
  /** Icon or thumbnail, muted by default and red while `error` is set. */
  thumb: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Trailing buttons: delete, cancel, download. */
  actions?: ReactNode;
  /** Covers the card while an action is in flight, e.g. a spinner. */
  overlay?: ReactNode;
  error?: boolean;
  bodyClassName?: string;
  /** Extra body content under the subtitle: a progress bar, a retry link. */
  children?: ReactNode;
}

/**
 * One file in a list of attachments: thumbnail, name, meta line and actions.
 *
 * The border thickens to two pixels on error while the padding stays put, so
 * the card keeps its size in both states.
 */
export const AttachmentCard: FC<AttachmentCardProps> = ({
  thumb,
  title,
  subtitle,
  actions,
  overlay,
  error,
  className,
  bodyClassName,
  children,
  ...rest
}) => (
  <div
    className={cn(
      'relative flex w-full rounded-lg p-3.5',
      error ? 'border-2 border-danger-subtle' : 'border border-secondary',
      className,
    )}
    {...rest}
  >
    {overlay && (
      <div className="absolute inset-0 z-2 flex items-center justify-center rounded-lg border border-dashed border-danger-subtle bg-primary/50 p-5 text-center">
        {overlay}
      </div>
    )}
    <div className={error ? 'text-danger' : 'text-quinary'}>{thumb}</div>
    <div className={cn('ml-4 grow', bodyClassName)}>
      <h6 className="mb-0 font-medium leading-5 text-secondary">{title}</h6>
      {subtitle ? (
        <p className="mb-0 text-sm leading-5 text-quaternary">{subtitle}</p>
      ) : null}
      {children}
    </div>
    {actions ? <div>{actions}</div> : null}
  </div>
);

/** The `<ul>` an {@link AttachmentCard} list sits in. */
export const AttachmentCardList: FC<ComponentProps<'ul'>> = ({
  className,
  ...rest
}) => (
  <ul
    className={cn('mt-2 mb-0 list-none space-y-2 p-0', className)}
    {...rest}
  />
);
