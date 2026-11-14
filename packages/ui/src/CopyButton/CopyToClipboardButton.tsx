import { CopyIcon } from '@phosphor-icons/react';
import { clsx } from 'clsx';
import { FunctionComponent, MouseEvent } from 'react';
import { translate } from 'waldur-i18n-runtime';

import { buttonVariants, ButtonVariant } from '../Button';
import { Tooltip } from '../Tooltip';

import { copyToClipboard, useCopyFeedback } from './CopyButton';

interface OwnProps {
  /** Copied as text; a number (an id, a count) is stringified. */
  value: string | number;
  size?: number;
  className?: string;
  buttonClassName?: string;
  /**
   * Renders as a real design-token icon button (`buttonVariants()`,
   * icon-only) instead of the default bare reset — for contexts
   * where the copy affordance needs its own hit target and hover fill
   * rather than sitting inline with surrounding text/other icons.
   */
  buttonVariant?: ButtonVariant;
  onlyButton?: boolean;
  verbose?: string;
  /** The button's accessible name, when "Copy to clipboard" does not say
   * what it copies (an icon next to a masked field). */
  label?: string;
}

/**
 * The bare copy icon after a value: in a table cell, beside a field. It
 * reports the copy to the enclosing `CopyFeedbackProvider`, which the app
 * turns into a toast ("Backend ID has been copied", from `verbose`). For a
 * copy button that stands by itself, with a label, use `CopyButton`.
 */
export const CopyToClipboardButton: FunctionComponent<OwnProps> = ({
  value,
  className,
  buttonClassName,
  buttonVariant,
  size,
  onlyButton,
  verbose,
  label = translate('Copy to clipboard'),
}) => {
  const onCopied = useCopyFeedback();

  const onClick = (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const text = String(value);
    copyToClipboard(text).then((ok) => {
      if (ok) onCopied?.({ value: text, name: verbose });
    });
  };

  // Rendered inline rather than as a nested component: one defined inside
  // this function would be a new component type on every render, remounting
  // the button (closing its tooltip, dropping keyboard focus) each time the
  // parent re-renders. The tooltip wraps the button, not the icon, so it
  // opens on keyboard focus as well as on hover.
  const button = (
    <Tooltip label={label}>
      <button
        className={clsx(
          buttonVariant
            ? buttonVariants({ variant: buttonVariant, iconOnly: true })
            : 'bg-transparent border-0 p-0 m-0 cursor-pointer text-quaternary hover:text-secondary in-[:is(td,th)]:inline-flex in-[:is(td,th)]:items-center in-[:is(td,th)]:justify-center in-[:is(td,th)]:min-w-[24px] in-[:is(td,th)]:min-h-[24px] in-[:is(td,th)]:mx-[calc((1em-24px)/2)] in-[:is(td,th)]:my-0 in-[:is(td,th)]:align-middle in-[:is(td,th)]:focus-visible:-outline-offset-2',
          buttonClassName,
        )}
        type="button"
        aria-label={label}
        onClick={onClick}
      >
        <CopyIcon weight="bold" size={size} />
      </button>
    </Tooltip>
  );

  return onlyButton ? (
    button
  ) : (
    <div className={clsx('my-1', className)}>{button}</div>
  );
};
