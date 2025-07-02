import { CopyIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { useCallback, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showSuccess } from '@waldur/store/notify';

interface CopyToClipboardProps {
  value;
  className?: string;
  label?: string;
  textButton?: boolean;
}

export const CopyToClipboard: FunctionComponent<CopyToClipboardProps> = ({
  value,
  label = translate('Copy to clipboard'),
  className,
  textButton,
}) => {
  const dispatch = useDispatch();

  const onClick = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      dispatch(showSuccess(translate('Value has been copied')));
    });
  }, [dispatch, value]);

  return textButton ? (
    <button
      className={classNames('text-btn', className)}
      type="button"
      onClick={onClick}
    >
      <CopyIcon /> {label}
    </button>
  ) : (
    <button
      className={classNames('btn', className)}
      type="button"
      onClick={onClick}
    >
      <span className="svg-icon svg-icon-2">
        <CopyIcon />
      </span>
      {label}
    </button>
  );
};
