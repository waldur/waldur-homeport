import { CopyIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { useCallback, FunctionComponent } from 'react';

import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';

interface OwnProps {
  value;
  size?: number;
  className?: string;
  buttonClassName?: string;
  onlyButton?: boolean;
  verbose?: string;
}

export const CopyToClipboardButton: FunctionComponent<OwnProps> = ({
  value,
  className,
  buttonClassName,
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
      className={classNames('text-btn', buttonClassName)}
      type="button"
      onClick={(e) => onClick(e)}
    >
      <Tip
        label={translate('Copy to clipboard')}
        id={'copyToClipboard-' + value}
      >
        <CopyIcon weight="bold" size={size} />
      </Tip>
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
