import classNames from 'classnames';
import copy from 'copy-to-clipboard';
import { useCallback, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { showSuccess } from '@waldur/store/notify';

interface OwnProps {
  value;
  size?: 'sm' | 'lg' | '2x' | '3x' | '4x' | '5x';
  className?;
}

export const CopyToClipboardButton: FunctionComponent<OwnProps> = ({
  value,
  className,
  size = 'lg',
}) => {
  const dispatch = useDispatch();

  const onClick = useCallback(
    (event) => {
      event.stopPropagation();
      copy(value);
      dispatch(showSuccess(translate('Text has been copied')));
    },
    [dispatch, value],
  );

  return (
    <p className={classNames('my-1', className)}>
      <button className="text-btn" type="button" onClick={(e) => onClick(e)}>
        <Tip label={translate('Copy to clipboard')} id="copyToClipboard">
          <i
            className={classNames(
              'fa fa-copy',
              size !== 'sm' ? `fa-${size}` : undefined,
            )}
          />
        </Tip>
      </button>
    </p>
  );
};
