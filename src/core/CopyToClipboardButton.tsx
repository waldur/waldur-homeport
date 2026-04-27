import { CopyIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { useCallback, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { showSuccess } from '@/store/notify';

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
  const dispatch = useDispatch();

  const onClick = useCallback(
    (event) => {
      event.stopPropagation();
      event.preventDefault();
      navigator.clipboard.writeText(value).then(() => {
        dispatch(
          showSuccess(translate('{name} has been copied', { name: verbose })),
        );
      });
    },
    [dispatch, value, verbose],
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
