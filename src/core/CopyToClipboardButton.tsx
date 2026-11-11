import { CopyIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { useCallback, FunctionComponent } from 'react';

import { buttonVariants, ButtonVariant, Tooltip } from 'waldur-ui';

import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';

interface OwnProps {
  value;
  size?: number;
  className?: string;
  buttonClassName?: string;
  /**
   * Renders as a real design-token icon button (`buttonVariants()`,
   * icon-only) instead of the default bare `text-btn` reset — for contexts
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

export const CopyToClipboardButton: FunctionComponent<OwnProps> = ({
  value,
  className,
  buttonClassName,
  buttonVariant,
  size,
  onlyButton,
  verbose = translate('Text'),
  label = translate('Copy to clipboard'),
}) => {
  const { showSuccess } = useNotify();

  const onClick = useCallback(
    (event) => {
      event.stopPropagation();
      event.preventDefault();
      navigator.clipboard.writeText(value).then(() => {
        showSuccess(translate('{name} has been copied', { name: verbose }));
      });
    },
    [value, verbose],
  );

  const CopyButton = () => (
    <button
      className={classNames(
        buttonVariant
          ? buttonVariants({ variant: buttonVariant, iconOnly: true })
          : 'text-btn in-[:is(td,th)]:inline-flex in-[:is(td,th)]:items-center in-[:is(td,th)]:justify-center in-[:is(td,th)]:min-w-[24px] in-[:is(td,th)]:min-h-[24px] in-[:is(td,th)]:mx-[calc((1em-24px)/2)] in-[:is(td,th)]:my-0 in-[:is(td,th)]:align-middle in-[:is(td,th)]:focus-visible:-outline-offset-2',
        buttonClassName,
      )}
      type="button"
      aria-label={label}
      onClick={(e) => onClick(e)}
    >
      <Tooltip label={label}>
        <CopyIcon weight="bold" size={size} />
      </Tooltip>
    </button>
  );

  return onlyButton ? (
    <CopyButton />
  ) : (
    <div className={classNames('my-1', className)}>
      <CopyButton />
    </div>
  );
};
