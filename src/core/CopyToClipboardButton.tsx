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
}

export const CopyToClipboardButton: FunctionComponent<OwnProps> = ({
  value,
  className,
  buttonClassName,
  buttonVariant,
  size,
  onlyButton,
  verbose = translate('Text'),
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
          : 'text-btn',
        buttonClassName,
      )}
      type="button"
      aria-label={translate('Copy to clipboard')}
      onClick={(e) => onClick(e)}
    >
      <Tooltip label={translate('Copy to clipboard')}>
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
