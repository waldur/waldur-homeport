import { CopyIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { useCallback, FunctionComponent } from 'react';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';

interface CopyToClipboardProps {
  value;
  className?: string;
  label?: string;
  textButton?: boolean;
  rightIcon?: boolean;
}

export const CopyToClipboard: FunctionComponent<CopyToClipboardProps> = ({
  value,
  label = translate('Copy to clipboard'),
  className,
  textButton,
  rightIcon,
}) => {
  const { showSuccess } = useNotify();

  const onClick = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      showSuccess(translate('Value has been copied'));
    });
  }, [value]);

  return textButton ? (
    <button
      className={classNames('text-btn', className)}
      type="button"
      onClick={onClick}
    >
      {rightIcon && label}
      <CopyIcon
        weight="bold"
        size="1.4em"
        className={rightIcon ? 'ms-2' : 'me-2'}
      />
      {!rightIcon && label}
    </button>
  ) : (
    <BaseButton
      variant="tertiary"
      className={className}
      onClick={onClick}
      iconNode={<CopyIcon weight="bold" />}
      iconRight={rightIcon}
      label={label}
    />
  );
};
